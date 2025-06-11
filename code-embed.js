// Generic Web Component loader for NA-ME.github.io hosting
// <script src="https://NA-ME.github.io/name.js">
// Load multiple files ?files=pro,foo,bar&type=module&async=false
((
    scriptSrc = document.currentScript.src,
    params = new URL(scriptSrc).searchParams,
    filename = scriptSrc.split("/").pop().split("."), // "code-embed.min.js"
    name = params.get("name") || filename[0], // web-component-loader.github.io/loader.js?name=code-embed
    files = params.get("files") || false, // false sets name in customElements registry
    minified = filename[1] == "min" ? filename[1] : "", // if src is minified call all minified files
    prefix = location.hostname.includes("github.io") ? `https://${params.get("host") || name}.github.io/` : "",
    scripts = [`${name}-baseclass${minified}.js`],
    async = params.get("async") || true,
) => {
    if (files) scripts.push(...files.split(",").map(module => `${name}-${module}${minified}.js`))
    document.head.append(...scripts.map((src, idx) => Object.assign(document.createElement("script"), {
        title: "injected",
        src: prefix + src,
        async, // default async:true
        [params.get("type") ? "type" : "notype"]: params.get("type") ? params.get("type") : "module",
        onload: () => console.log(`%c Loaded (${async ? "async " : ""}${idx}) %c %s `, "background:gold;color:black", "background:green;color:white", src),
        onerror: () => console.log(`%c Failed (${idx}) %c %s `, "background:red;color:black", "background:green;color:white", src)
    })));
    customElements.whenDefined(name + "-baseclass").then(B => !files && customElements.define(name, class extends B { }));
})();

