export const elementSchema = {
    LeftCornerX: 'number',
    LeftCornerY: 'number',
    RightCornerX: 'number',
    RightCornerY: 'number',
    owner: 'string',
    type: 'string',
    selectedColor: 'number',
    selectedTextColor: 'number',
    selectedElement: 'boolean',
    offsetPenX: 'number',
    offsetPenY: 'number',
    textString: 'string',
    allowText: 'boolean',
    pointsPenArray: 'any[]',
    scalePenX: 'number',
    scalePenY: 'number',
    initialWidth: 'number',
    initialHeight: 'number',
    elementId: 'string',
};

export function parseValueFromServer(value, type) {
    switch(type) {
        case 'number':
            return Number(value);
        case 'string':
            return String(value);
        case 'boolean':
            return JSON.parse(value);
        case 'any[]':
            if (!value) {
                return [];
            }
            return JSON.parse(value);
        default:
            return value;
    }
}

export function convertDataFormDB(data, elementSchema) {
    const convertData = [];
    data.map(element => {
        const convertedData = {};
        for (const key in element) {
            if (elementSchema[key]) {
                convertedData[key]=parseValueFromServer(element[key], elementSchema[key]);
            }
        }
        if (convertedData) {
            convertData.push(convertedData);
        }
    });
    return convertData;
}

export const elementDBSchema = {
    LeftCornerX: 'string',
    LeftCornerY: 'string',
    RightCornerX: 'string',
    RightCornerY: 'string',
    owner: 'string',
    type: 'string',
    selectedColor: 'string',
    selectedTextColor: 'string',
    selectedElement: 'string',
    offsetPenX: 'string',
    offsetPenY: 'string',
    textString: 'string',
    allowText: 'string',
    pointsPenArray: 'string',
    scalePenX: 'string',
    scalePenY: 'string',
    initialWidth: 'string',
    initialHeight: 'string',
    elementId: 'string',
}

export function parseValueToServer(value, type) {
    switch(type) {
        case 'string':
            if (typeof value === 'string') {
                return value;
            }
            return JSON.stringify(value);
        default:
            return value;
    }
}

export function prepareObjectToServer(elementData, elementDBSchema) {
    const prepared = {};
    for (const key in elementData) {
        if (elementDBSchema[key]) {
            prepared[key]=parseValueToServer(elementData[key], elementDBSchema[key]);
        }
    }
    return prepared;
}