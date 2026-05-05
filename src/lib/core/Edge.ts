import { Node } from './Node';


interface IEdgeProps<T1, T2> {
    id: string
    source: Node<T1>
    target: Node<T1>
    color?: string
    label?: string | null
    props?: T2
}


export class Edge<T1, T2> implements IEdgeProps<T1, T2> {
    private _id: string;
    private _source: Node<T1>;
    private _target: Node<T1>;
    private _color?: string;
    private _label?: string | null;
    private _props?: T2;

    constructor(id: string, source: Node<T1>, target: Node<T1>, color?: string, label?: string | null, props?: T2) {
        this._id = id
        this._source = source
        this._target = target
        this._color = color
        this._label = label
        this._props = props
    }

    get id(){
        return this._id
    }

    get source(){
        return this._source
    }

    get target(){
        return this._target
    }

    get props(){
        return this._props
    }

    get color(){
        return this._color
    }

    get label(){
        return this._label
    }

    public setColor(color: string){
        this._color = color
    }

    public setLabel(label: string | null){
        this._label = label
    }
}

