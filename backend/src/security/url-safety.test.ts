import assert from "node:assert/strict";
import test from "node:test";

import { assertPublicHttpUrl, isBlockedHostname } from "./url-safety.js";

test("blocks local and private IPv4 targets", () => {
  for (const hostname of [
    "localhost",
    "127.0.0.1",
    "10.0.0.1",
    "172.16.0.1",
    "192.168.1.1",
    "169.254.169.254",
  ]) {
    assert.equal(isBlockedHostname(hostname), true, hostname);
  }
});

test("blocks local and private IPv6 targets, including IPv4 encodings", () => {
  for (const hostname of [
    "::",
    "::1",
    "fc00::1",
    "fd12:3456::1",
    "fe80::1",
    "::ffff:127.0.0.1",
    "::ffff:10.0.0.1",
    "::127.0.0.1",
    "::7f00:1",
  ]) {
    assert.equal(isBlockedHostname(hostname), true, hostname);
  }
});

test("does not classify representative public addresses as private", () => {
  assert.equal(isBlockedHostname("8.8.8.8"), false);
  assert.equal(isBlockedHostname("2606:4700:4700::1111"), false);
  assert.equal(isBlockedHostname("example.com"), false);
});

test("rejects private literal targets before attempting DNS resolution", async () => {
  for (const url of [
    "http://127.0.0.1/",
    "http://169.254.169.254/latest/meta-data/",
    "http://[::1]/",
    "http://[::ffff:127.0.0.1]/",
    "http://[::7f00:1]/",
  ]) {
    await assert.rejects(assertPublicHttpUrl(url), /private or local address/, url);
  }
});

test("rejects malformed and non-HTTP targets", async () => {
  await assert.rejects(assertPublicHttpUrl("not a URL"), /valid URL/);
  await assert.rejects(assertPublicHttpUrl("file:///etc/passwd"), /HTTP or HTTPS/);
  assert.ok(true);
});
