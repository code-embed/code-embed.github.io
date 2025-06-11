((
    s = document.currentScript.src,
    v = new URL(s).searchParams.get("v"),
    f = s.split("/").pop().split("."),
    n = f[0],
    m = f[1] == "min" ? f[1] : ""
) => {
    document.head.append(...[n + `-baseclass${m}.js`, ...(v ? [n + `-${v}${m}.js`] : [])]
        .map(src => Object.assign(document.createElement("script"), {
            title: "injected", src, async: true, type: "module", onload: () => v && console.log("Loaded:", src)
        })));
    customElements.whenDefined(n + "-baseclass").then(B => !v && customElements.define(n, class extends B { })
    );
})();
