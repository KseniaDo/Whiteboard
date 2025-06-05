import { Container, Graphics } from 'pixi.js';
import Element from "./element";

export default class TransformTool {
    toolName = null;
    changeElement = null;
    startPointX = null;
    startPointY = null;
    endPointX = null;
    endPointY = null;

    moveType = null;
    scaleType = null;

    startWidth = null;
    startHeight = null;
    startLCX = null;
    startLCY = null;

    offsetX = 0;
    offsetY = 0;

    transformType = null;
    allowChange = false;

    constructor (toolNameString) {
        this.toolName = toolNameString;
        this.changeElement = new Element(this.toolName);
    }

    setNewTransform (point, event, selectElement) {
        this.setTransformType(event);
        if (this.toolName == 'selectTool') {
            switch(this.transformType) {
                case 'moving':
                    this.setNewMove(selectElement, event, point);
                    break;
                case 'scaling':
                    this.setNewScale(event, point);
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
            this.setDiffSPCont(selectElement);
        }
    }

    setNewScale(event, point) {
        const [PointX, PointY] = this.getPointCoordinates(point);
        this.setScaleType(event.target.label);
        this.setStartPoint(PointX, PointY);
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
                [DiffX, DiffY] = this.redrawNewMoveCanvas(point, selectElement);
                [PointX, PointY] = this.getPointCoordinates(point);
                this.setStartPoint(PointX, PointY);
            } else {
                if (this.allowChange) {
                    switch(this.transformType) {
                        case 'moving':
                            [PointX, PointY] = this.getPointCoordinates(point);
                            this.redrawNewMove(selectElement, PointX, PointY, final);
                            break;
                        case 'scaling':
                            [PointX, PointY] = this.getPointCoordinates(point);
                            if (this.scaleType) {
                                this.redrawNewScaleCanvas(final, point, selectElement);
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

    setDiffSPCont (selectElement) {
        const [contLeftX, contLeftY] = [selectElement.LeftCornerX, selectElement.LeftCornerY];
        this.offsetX = this.startPointX - contLeftX;
        this.offsetY = this.startPointY - contLeftY;
    }

    getMoveDiff (eventData) {
        const DiffX = eventData.x - this.startPointX;
        const DiffY = eventData.y - this.startPointY;
        return [DiffX, DiffY]
    }

    redrawNewMove(selectedElement, endPointX, endPointY, final) {
        let sideChangeX, sideChangeY
        switch (this.moveType) {
            case 'straight':
                sideChangeX = endPointX - this.startPointX;
                sideChangeY = endPointY - this.startPointY;
                if (sideChangeX > sideChangeY) {
                    selectedElement.LeftCornerX = (endPointX - this.offsetX);
                    selectedElement.RightCornerX = (selectedElement.LeftCornerX + selectedElement.containerWidth);
                } else {
                    selectedElement.LeftCornerY = (endPointY - this.offsetY);
                    selectedElement.RightCornerY = (selectedElement.LeftCornerY + selectedElement.containerHeight);
                }
                break;
            default:
                selectedElement.LeftCornerX = (endPointX - this.offsetX);
                selectedElement.RightCornerX = (selectedElement.LeftCornerX + selectedElement.containerWidth);
                selectedElement.LeftCornerY = (endPointY - this.offsetY);
                selectedElement.RightCornerY = (selectedElement.LeftCornerY + selectedElement.containerHeight);
                break;
        }
        const DiffX = endPointX - this.startPointX;
        const DiffY = endPointY - this.startPointY;
        selectedElement.redrawOuterContainer(final, DiffX, DiffY);
    }

    redrawNewMoveCanvas(event, canvasElement) {
        const [DiffX, DiffY] = this.getMoveDiff(event);
        const currentPosX = canvasElement.position.x
        const currentPosY = canvasElement.position.y
        canvasElement.position.set(currentPosX + DiffX * 0.85, currentPosY + DiffY * 0.85);
        return [DiffX, DiffY]
    }

    redrawNewScaleCanvas(final, event, selectElement) {

        if (!this.startWidth && !this.startHeight) {
            this.startWidth = selectElement.containerWidth;
            this.startHeight = selectElement.containerHeight;

            this.startLCX = selectElement.LeftCornerX;
            this.startLCY = selectElement.LeftCornerY;
        }

        const [PointX, PointY] = this.getPointCoordinates(event);

        switch (this.scaleType) {
            case 'LeftUp':
                selectElement.LeftCornerX = PointX;    
                selectElement.LeftCornerY = PointY;
                break;
            case 'LeftDown':
                selectElement.LeftCornerX = PointX;
                selectElement.RightCornerY = PointY;
                break;
            case 'RightDown':
                selectElement.RightCornerX = PointX;
                selectElement.RightCornerY = PointY;
                break;
            case 'RightUp':
                selectElement.RightCornerX = PointX;
                selectElement.LeftCornerY = PointY;
                break;
            default:
                console.log("Error: scale");
                break;
        }

        const diffCornerX = selectElement.LeftCornerX - this.startLCX;
        const diffCornerY = selectElement.LeftCornerY - this.startLCY;

        const newWidthAfterChange = selectElement.RightCornerX - selectElement.LeftCornerX;
        const newHeightAfterChange = selectElement.RightCornerY - selectElement.LeftCornerY;
        const scaleX = newWidthAfterChange / this.startWidth;
        const scaleY = newHeightAfterChange / this.startHeight;

        if (this.scaleType) {
            selectElement.mainContainer.scale.set(scaleX, scaleY);
        }

        selectElement.redrawOuterContainerScale(final, scaleX, scaleY, diffCornerX, diffCornerY);
    }
}