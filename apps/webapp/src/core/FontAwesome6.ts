// FONT AWESOME 6
import { library } from "@fortawesome/fontawesome-svg-core";
import * as Icons from "@fortawesome/free-solid-svg-icons";

export function initFontAwesome6() {
  library.add(...iconList);
}

// Maybe we should load only the icons we use in the app, rather than all of them?
const iconList = Object.keys(Icons)
  .filter((key) => key !== "fas" && key !== "prefix")
  //@ts-expect-error("TypeScript doesn't like this, but it's fine. Just loading all fontawesome icons")
  .map((icon) => Icons[icon]);

export const FontAwesome6IconNames = iconList.map((x) => x.iconName);
