import {NodeSpec} from "prosemirror-model";

export const YOUTUBE_EMBED = "youtube_embed"
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

export function youtube_embed(state,node: any) {
    console.log('serializing the youtube embed with node',node)
    state.write(`{% embed url="https://youtu.be/${node.attrs.slug}" %}`)
    // state.write('youtube_embed' + node.attrs.slug)
    state.closeBlock(node)
}