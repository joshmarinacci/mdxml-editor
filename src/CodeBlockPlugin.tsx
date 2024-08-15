import {useLexicalComposerContext} from "@lexical/react/LexicalComposerContext";
import {useEffect} from "react";
import {$insertNodeToNearestRoot} from '@lexical/utils';
import {
    $getRoot,
    $getSelection,
    COMMAND_PRIORITY_EDITOR,
    createCommand,
    ElementNode,
    LexicalCommand,
    LexicalNode,
    NodeKey
} from "lexical";


export const INSERT_CODEBLOCK_COMMAND: LexicalCommand<string> = createCommand();

export class CodeBlockNode extends ElementNode {
    private payload: string;
    constructor(payload:string, key?:NodeKey) {
        super(key);
        this.payload = payload
    }
    static getType(): string {
        return 'joshcodeblock';
    }

    static clone(node: CodeBlockNode): CodeBlockNode {
        return new CodeBlockNode(node.payload, node.__key);
    }

    createDOM(): HTMLElement {
        // Define the DOM element here
        const dom = document.createElement('div');
        dom.classList.add('josh-code-block');
        const text = document.createTextNode(this.payload);
        dom.appendChild(text);
        return dom;
    }

    updateDOM(prevNode: CodeBlockNode, dom: HTMLElement): boolean {
        // Returning false tells Lexical that this node does not need its
        // DOM element replacing with a new copy from createDOM.
        return false;
    }
}

export function $createCodeBlockNode(payload: string) {
    return new CodeBlockNode(payload)
}

export function $isCodeBlockNode(node: LexicalNode | null | undefined): node is CodeBlockNode  {
    return node instanceof CodeBlockNode;
}

export function CodeBlockPlugin() {
    const [editor] = useLexicalComposerContext()

    const do_insert = () => {
        editor.update(() => {
            console.log("doing an editor update")
            const node = $createCodeBlockNode("for\nyou");
            $insertNodeToNearestRoot(node)
        })
    }
    useEffect(() => {
        if (!editor.hasNodes([CodeBlockNode])) {
            throw new Error('CodeBlockPlugin: CodeBlockNode not registered on editor (initialConfig.nodes)');
        }
        // console.log("registering the command")
        // return editor.registerCommand<string>(
        //     INSERT_CODEBLOCK_COMMAND,
        //     (payload) => {
        //         const selection = $getSelection();
        //         console.log('selection is',selection)
        //         console.log("payload is",payload)
        //         // let root = $getRoot()
        //         const node = $createCodeBlockNode("folo");
        //         // $insertNodeToNearestRoot(node)
        //         if(selection) selection.insertNodes([node])
        //         return true;
        //     },
        //     COMMAND_PRIORITY_EDITOR,
        // );
    }, [editor]);
    return <div>
        <button onClick={do_insert}>+ Code Bock</button>
    </div>
}
