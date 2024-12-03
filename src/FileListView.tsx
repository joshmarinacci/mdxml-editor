import {useState} from "react";
import {ListItemRenderer, ListView, StringRenderer, useChanged} from "rtds-react";
import {ObjMaybe} from "rtds-core";
import {DocsetModel, PageModel} from "./model";

const rend:ListItemRenderer<typeof PageModel> = (value) => {
    return <span className={'file-item'}>{value.get('title').get()}</span>
}

export function FileListView(props: { className: string, docset: typeof DocsetModel }) {
    // let selected = props.docset.get('selectedFile')
    // useChanged(props.site)
    return <div className={'file-list'}>
        <ListView data={props.docset.get('pages')}
                  itemRenderer={rend}
                  selected={props.docset.get('selectedPage')}
                  onSelect={(e) => {
                      props.docset.get('selectedPage').clear()
                      props.docset.get('selectedPage').push(e)
                  }}
        />
    </div>
}
