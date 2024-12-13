import {ListItemRenderer, ListView, StringRenderer, useChanged} from "rtds-react";
import {Docset, PageModel} from "./model";

const rend:ListItemRenderer<typeof PageModel> = (value) => {
    return <>
        <span>{value.get('title').get()}</span>
        <span>{value.get('created').get()?"":"*"}</span>
    </>
}

export function FileListView(props: { className: string, docset: Docset }) {
    useChanged(props.docset)
    return <div className={'file-list'}>
        <ListView data={props.docset.get('pages')}
                  itemRenderer={rend}
                  selected={props.docset.get('selectedPage')}
                  reorderable={true}
                  onSelect={(e) => {
                      props.docset.get('selectedPage').clear()
                      props.docset.get('selectedPage').push(e)
                  }}
        />
    </div>
}
