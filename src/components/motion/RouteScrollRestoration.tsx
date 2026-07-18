import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function RouteScrollRestoration() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const targetId = hash.replace(/^#/, "");

    if (!targetId) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      return;
    }

    const target = document.getElementById(decodeURIComponent(targetId));
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [pathname, hash]);

  return null;
}
