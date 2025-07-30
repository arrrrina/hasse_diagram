


interface INodeProps<T> {
    id: string
    label: string | null
    color?: string
    weight?:string | null
    props?: T
}


export class Node<T> implements INodeProps<T> {
    private _id: string;
    private _label: string | null;
    private _color?: string;
    private _weight?:string | null;
    private _props?: T;

    constructor(id: string, label: string | null, color?: string, weight?:string | null, props?: T) {
        this._id = id
        this._label = label
        this._color = color
        this._weight = weight
        this._props = props
    }

    public clone(): Node<T> {
        return new Node<T>(
            this._id,
            this._label,
            this._color,
            this._weight,
            this._props
        );
    }

    get id(){
        return this._id
    }

    get label(){
        return this._label
    }

    get weight(){
        return this._weight
    }

    get props(){
        return this._props
    }

    get color(){
        return this._color
    }

    public setColor(color: string){
        this._color = color
    }

    public setLabel(label: string | null){
        this._label = label
    }
    
    public setWeight(weight: string | null){
        this._weight = weight
    }
}

