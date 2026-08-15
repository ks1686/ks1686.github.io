import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dir, "..");
const html = readFileSync(join(root, "index.html"), "utf8");

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

assert(existsSync(join(root, "favicon.ico")), "missing favicon.ico");
assert(existsSync(join(root, "apple-touch-icon.png")), "missing apple-touch-icon.png");
assert(existsSync(join(root, "og-image.jpg")), "missing og-image.jpg");
assert(existsSync(join(root, "Resume_Karim_Smires_2026.pdf")), "missing 2026 résumé PDF");
assert(!existsSync(join(root, "Resume_Karim_Smires_2025.pdf")), "2025 résumé PDF should be removed");

assert(html.includes('rel="canonical"'), "missing canonical link");
assert(html.includes('property="og:image"'), "missing Open Graph image");
assert(html.includes('name="twitter:card"'), "missing Twitter card");
assert(html.includes('class="skip-link"'), "missing skip link");
assert(html.includes('id="nav-toggle"'), "missing mobile nav toggle");
assert(html.includes('href="#education"'), "education missing from nav");
assert(html.includes("scroll-margin-top"), "missing scroll-margin-top for sticky nav");
assert(html.includes("initializeMobileNav"), "missing mobile nav script");
assert(!html.includes("enrichGitHubRepoContext"), "README fan-out helper should be gone");
assert(!html.includes("decodeBase64Utf8"), "README decoder should be gone");
assert(!html.includes("/readme"), "page should not fetch GitHub READMEs");
assert(!html.includes("Resume_Karim_Smires_2025.pdf"), "HTML should not link the 2025 PDF");
assert(html.includes("Resume_Karim_Smires_2026.pdf"), "HTML should link the 2026 PDF");

console.log("static site checks passed");
