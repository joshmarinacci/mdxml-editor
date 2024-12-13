import {NodeSpec} from "prosemirror-model";

export const YoutubeLinkNodeSpec: NodeSpec = {
    attrs: { slug: { default: "asdf" }},
    inline: false,
    group: "block",
    atom: true,
}

export class YoutubeEmbedView {
    private dom: HTMLInputElement;

    constructor(node: any) {
        console.log("Making an embed", node)
        this.dom = document.createElement('input')
        this.dom.setAttribute('type', 'text')
        this.dom.setAttribute('placeholder', 'youtube_embed')
        this.dom.setAttribute('value', node.attrs.slug)
        this.dom.addEventListener("click", e => {
            console.log("You clicked me!")
            e.preventDefault()
        })
    }

    stopEvent() {
        return true
    }
}