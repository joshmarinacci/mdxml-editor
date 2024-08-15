import './App.css'


import {$getRoot, $getSelection} from 'lexical';
import {useEffect} from 'react';

import {AutoFocusPlugin} from '@lexical/react/LexicalAutoFocusPlugin';
import {LexicalComposer} from '@lexical/react/LexicalComposer';
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';
import {ContentEditable} from '@lexical/react/LexicalContentEditable';
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';
import {LexicalErrorBoundary} from '@lexical/react/LexicalErrorBoundary';

import ExampleTheme from './ExampleTheme';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import TreeViewPlugin from './plugins/TreeViewPlugin';

const placeholder = 'Enter some rich text...';

const editorConfig = {
    namespace: 'React.js Demo',
    nodes: [],
    // Handling of errors during update
    onError(error: Error) {
        throw error;
    },
    // The editor theme
    theme: ExampleTheme,
};

export function App() {
    return (
        <LexicalComposer initialConfig={editorConfig}>
            <div className="editor-container">
                <ToolbarPlugin />
                <div className="editor-inner">
                    <RichTextPlugin
                        contentEditable={
                            <ContentEditable
                                className="editor-input"
                                aria-placeholder={placeholder}
                                placeholder={
                                    <div className="editor-placeholder">{placeholder}</div>
                                }
                            />
                        }
                        ErrorBoundary={LexicalErrorBoundary}
                    />
                    <HistoryPlugin />
                    <AutoFocusPlugin />
                    <TreeViewPlugin />
                </div>
            </div>
        </LexicalComposer>
    );
}
