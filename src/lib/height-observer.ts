interface HeightObserverParams {
    getSrcElement: () => HTMLElement | null;
    onHeightChange: (height: number) => void;
}

const defaultParams: HeightObserverParams = {
    getSrcElement: () => null,
    onHeightChange: () => {},
};

export class HeightObserver {
    prevHeight = 0;

    params: HeightObserverParams = defaultParams;

    constructor(params: HeightObserverParams) {
        this.params = {...params};
    }

    destroy() {
        this.updateHeight(0);
        this.params = defaultParams;
    }

    get node() {
        return this.params.getSrcElement();
    }

    checkAndUpdateHeight = () => {
        if (this.node) {
            requestAnimationFrame(() => {
                const node = this.node;
                if (node) {
                    this.updateHeight(node.offsetHeight);
                } else {
                    this.updateHeight(0);
                }
            });
        } else {
            this.updateHeight(0);
        }
    };

    updateHeight(height: number) {
        if (this.prevHeight !== height) {
            this.prevHeight = height;
            this.params.onHeightChange(height);
        }
    }
}
