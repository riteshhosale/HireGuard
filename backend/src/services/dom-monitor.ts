import type { Page } from "playwright";
import type {
  FormEvidence,
  FormField,
} from "./types.js";

export interface DomEvidence {
  title: string;
  text: string;
  forms: FormEvidence[];
}

export async function collectDomEvidence(
  page: Page,
): Promise<DomEvidence> {
  const title = await page.title();

  let text = "";

  try {
    text = await page.innerText("body");
  } catch {
    text = "";
  }

  const forms =
    await page
      .locator("form")
      .evaluateAll((elements) => {
        return elements.map((form) => {
          const htmlForm =
            form as HTMLFormElement;

          const fields =
            Array.from(
              htmlForm.querySelectorAll(
                "input, textarea, select",
              ),
            ).map(
              (
                element,
              ): FormField => {
                const input =
                  element as
                    | HTMLInputElement
                    | HTMLTextAreaElement
                    | HTMLSelectElement;

                return {
                  name:
                    input.getAttribute(
                      "name",
                    ) ?? "",

                  type:
                    input.getAttribute(
                      "type",
                    ) ??
                    input.tagName.toLowerCase(),

                  placeholder:
                    input.getAttribute(
                      "placeholder",
                    ) ?? undefined,

                  autocomplete:
                    input.getAttribute(
                      "autocomplete",
                    ) ?? undefined,
                };
              },
            );

          return {
            action:
              htmlForm.action || "",

            method: (
              htmlForm.method ||
              "GET"
            ).toUpperCase(),

            fields,
          };
        });
      });

  return {
    title,
    text,
    forms,
  };
}