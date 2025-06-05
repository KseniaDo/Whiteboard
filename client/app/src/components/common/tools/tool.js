import DrawTool from "./drawTool";
import TransformTool from "./transformTool";

export default class Tool {
    toolName = null;
    tool = null;
    mouseDown = false;
    scaleCanvas = 1;
    currentLocalPoint = {
        x: 0,
        y: 0
    }
    allowSelection = true;

    constructor (toolNameString) {
        this.toolName = toolNameString;
        switch(toolNameString) {
            case 'penTool':
            case 'rectTool':
            case 'ellipseTool':
            case 'textTool':
            case 'arrowTool':
                this.tool = new DrawTool(toolNameString);
                break;
            case 'selectTool':
            case 'moveTool':
            case 'scaleTool':
                this.tool = new TransformTool(toolNameString);
                break;
            default:
                console.log("Error: unexistsing tool");
                break;
        }
    }

    selectProccessing(currentElement, selectMode) {
        switch(this.toolName) {
            case 'selectTool':
            case 'moveTool':
            case 'scaleTool':
                currentElement.setSelectMode(selectMode);
                currentElement.redrawGraphics();
                break;
            default:
                console.log("Error: select");
                break;
        }
    }

    startProccessing(event, color = null, selectedElement = null) {
        switch(this.toolName) {
            case 'penTool':
            case 'rectTool':
            case 'ellipseTool':
            case 'textTool':
            case 'arrowTool':
                this.tool.setDrawableElement(this.currentLocalPoint, color, this.scaleCanvas);
                break;
            case 'selectTool':
            case 'moveTool':
            case 'scaleTool':
                this.tool.setNewTransform(this.currentLocalPoint, event, selectedElement);
                break;
            default:
                console.log("Error: unexistsing tool");
                break;
        }
    }

    redrawProccessing(event, selectedElement, final = false, color = null) {
        switch(this.toolName) {
            case 'penTool':
            case 'rectTool':
            case 'ellipseTool':
            case 'textTool':
            case 'arrowTool':
                this.tool.redrawDrawableElement(event, this.currentLocalPoint, final, color);
                break;
            case 'selectTool':
            case 'moveTool':
            case 'scaleTool':
                this.tool.redrawNewTransform(this.currentLocalPoint, event, selectedElement, final);
                break;
            default:
                console.log("Error: unexistsing tool");
                break;
        }
    }
}