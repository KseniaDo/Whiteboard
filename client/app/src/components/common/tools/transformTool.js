import { Container, Graphics } from 'pixi.js';
import Element from "./element";

export default class TransformTool {
    toolName = null;

    editableElement = null;

    startPointX = null;
    startPointY = null;
    endPointX = null;
    endPointY = null;

    moveType = null;
    scaleType = null;

    startWidth = null;
    startHeight = null;

    startLCUX = null;
    startLCUY = null;

    offsetX = 0;
    offsetY = 0;

    transformType = null;
    allowChange = false;

    constructor (toolNameString) {
        this.toolName = toolNameString;
        this.editableElement = new Element(this.toolName);
    }

    setNewTransform (point, event, selectElement) {
        this.setTransformType(event);
        if (this.toolName == 'selectTool') {
            switch(this.transformType) {
                case 'moving':
                    this.setNewMove(selectElement, event, point);
                    break;
                case 'scaling':
                    this.setNewScale(selectElement, event, point);
                    break;
                default:
                    console.log("Error: unexistsing tool");
                    break;
            }
        }
    }

    setTransformType(event) {
        switch(event.target.label) {
            case 'LeftUp':
            case 'LeftDown':
            case 'RightDown':
            case 'RightUp':                
                this.transformType = 'scaling';
                break;
            default:
                this.transformType = 'moving';
                break;
        }
    }

    setNewMove(selectElement, event, point) {
        const [PointX, PointY] = this.getPointCoordinates(point);
        if (selectElement == null) {
            this.setStartPoint(PointX, PointY);
        } else {
            this.setMoveType(event);
            this.setStartPoint(PointX, PointY);
            this.setOffset(selectElement);
        }
    }

    setNewScale(selectElement, event, point) {
        const [PointX, PointY] = this.getPointCoordinates(point);
        if (selectElement == null) {
            this.setStartPoint(PointX, PointY);
        } else {
            this.setScaleType(event.target.label);
            this.setStartPoint(PointX, PointY);
        }
    }

    redrawNewTransform (point, event, selectElement, final) {
        let DiffX, DiffY;
        let PointX, PointY;
        [PointX, PointY] = this.getPointCoordinates(point);
        this.setEndPoint(PointX, PointY);
        if (!this.allowChange) {
            if (Math.abs(this.startPointX - this.endPointX) > 5 || Math.abs(this.startPointY - this.endPointY) > 5) {
                this.allowChange = true;
            }
        }
        if (this.toolName == 'selectTool') {
            if (selectElement instanceof Container && this.allowChange) {
                [DiffX, DiffY] = this.redrawCanvasPosition(point, selectElement);
                [PointX, PointY] = this.getPointCoordinates(point);
                this.setStartPoint(PointX, PointY);
            } else {
                if (this.allowChange) {
                    switch(this.transformType) {
                        case 'moving':
                            [PointX, PointY] = this.getPointCoordinates(point);
                            this.redrawSelectionContainerPosition(selectElement, PointX, PointY, final);
                            break;
                        case 'scaling':
                            [PointX, PointY] = this.getPointCoordinates(point);
                            if (this.scaleType) {
                                this.redrawSelectionContainerScale(final, point, selectElement);
                            }
                            break;
                        default:
                            console.log("Error: unexistsing tool");
                            break;
                    }
                }
            }
        }
    }

    getPointCoordinates (eventData) {
        const PointX = eventData.x;
        const PointY = eventData.y;
        return [PointX, PointY]
    }

    setStartPoint(x, y) {
        this.startPointX = x;
        this.startPointY = y;
    }

    setEndPoint(x, y) {
        this.endPointX = x;
        this.endPointY = y;
    }

    setMoveType (event) {
        if (event.shiftKey) {
            this.moveType = 'straight';
        } else {
            this.moveType = 'any';
        }
    }

    setScaleType (targetLabel) {
        switch (targetLabel) {
            case 'LeftUp':
                this.scaleType = 'LeftUp';
                break;
            case 'LeftDown':
                this.scaleType = 'LeftDown';
                break;
            case 'RightDown':
                this.scaleType = 'RightDown';
                break;
            case 'RightUp':
                this.scaleType = 'RightUp';
                break;
            case 'selectedElement':
                this.scaleType = null;
                break;
            default:
                this.scaleType = null;
                break;
        }
    }

    setOffset (selectElement) {
        const [contLeftX, contLeftY] = [selectElement.leftUpCornerX, selectElement.leftUpCornerY];
        this.offsetX = this.startPointX - contLeftX;
        this.offsetY = this.startPointY - contLeftY;
    }

    getMoveDiff (eventData) {
        const DiffX = eventData.x - this.startPointX;
        const DiffY = eventData.y - this.startPointY;
        return [DiffX, DiffY]
    }

    redrawSelectionContainerPosition(selectedElement, endPointX, endPointY, final) {
        let sideChangeX, sideChangeY
        switch (this.moveType) {
            case 'straight':
                sideChangeX = endPointX - this.startPointX;
                sideChangeY = endPointY - this.startPointY;
                if (sideChangeX > sideChangeY) {
                    selectedElement.leftUpCornerX = (endPointX - this.offsetX);
                    selectedElement.rightDownCornerX = (selectedElement.leftUpCornerX + selectedElement.width);
                } else {
                    selectedElement.leftUpCornerY = (endPointY - this.offsetY);
                    selectedElement.rightDownCornerY = (selectedElement.leftUpCornerY + selectedElement.height);
                }
                break;
            default:
                selectedElement.leftUpCornerX = (endPointX - this.offsetX);
                selectedElement.rightDownCornerX = (selectedElement.leftUpCornerX + selectedElement.width);
                selectedElement.leftUpCornerY = (endPointY - this.offsetY);
                selectedElement.rightDownCornerY = (selectedElement.leftUpCornerY + selectedElement.height);
                break;
        }
        const DiffX = endPointX - this.startPointX;
        const DiffY = endPointY - this.startPointY;
        selectedElement.setContainerPosition(final, DiffX, DiffY);
    }

    redrawCanvasPosition(event, canvasElement) {
        const [DiffX, DiffY] = this.getMoveDiff(event);
        const currentPosX = canvasElement.position.x
        const currentPosY = canvasElement.position.y
        canvasElement.position.set(currentPosX + DiffX * 0.4, currentPosY + DiffY * 0.4);
        return [DiffX, DiffY]
    }

    redrawSelectionContainerScale(final, event, selectElement) {

        if (!this.startWidth && !this.startHeight) {
            this.startWidth = selectElement.width;
            this.startHeight = selectElement.height;

            this.startLCUX = selectElement.leftUpCornerX;
            this.startLCUY = selectElement.leftUpCornerY;
        }

        const [PointX, PointY] = this.getPointCoordinates(event);

        switch (this.scaleType) {
            case 'LeftUp':
                selectElement.leftUpCornerX = PointX;    
                selectElement.leftUpCornerY = PointY;
                break;
            case 'LeftDown':
                selectElement.leftUpCornerX = PointX;
                selectElement.rightDownCornerY = PointY;
                break;
            case 'RightDown':
                selectElement.rightDownCornerX = PointX;
                selectElement.rightDownCornerY = PointY;
                break;
            case 'RightUp':
                selectElement.rightDownCornerX = PointX;
                selectElement.leftUpCornerY = PointY;
                break;
            default:
                console.log("Error: scale");
                break;
        }

        const diffCornerX = selectElement.leftUpCornerX - this.startLCUX;
        const diffCornerY = selectElement.leftUpCornerY - this.startLCUY;

        const newWidthAfterChange = selectElement.rightDownCornerX - selectElement.leftUpCornerX;
        const newHeightAfterChange = selectElement.rightDownCornerY - selectElement.leftUpCornerY;
        const scaleX = newWidthAfterChange / this.startWidth;
        const scaleY = newHeightAfterChange / this.startHeight;

        if (this.scaleType) {
            selectElement.container.scale.set(scaleX, scaleY);
        }

        selectElement.setContainerScale(final, scaleX, scaleY, diffCornerX, diffCornerY);
    }
}