const { readFile, readdir } = require('fs/promises');
const { cwd } = require('process');
const { join } = require('path');

const excludes = ['node_modules', 'coverage', '.github', '.git', 'dist'];
const simpleTypes = ['string', 'number', 'boolean', 'null', 'undefined'];
const result = {}

const getFilesRecursive = async(path) => {
    const filePaths = [];

    const dirents = await readdir(path, {
        withFileTypes: true
    });

    for(let i = 0; i < dirents.length; i++) {
        const dirent = dirents[i];
        if(dirent.isDirectory()) {
            if(excludes.includes(dirent.name)) {
                continue;
            }
            const subFiles = await getFilesRecursive(join(path, dirent.name));
            filePaths.push(...subFiles);
        } else if(dirent.isFile()) {
            filePaths.push(join(path, dirent.name));
        }
    }

    return filePaths;
}

const interface2obj = async (path) => {
    const obj = {};
    let interfaceStr = await (await readFile(path)).toString();
    interfaceStr = interfaceStr.slice(interfaceStr.lastIndexOf('interface'));
    const name = interfaceStr.substring(interfaceStr.indexOf('interface') + 10, interfaceStr.indexOf('{')).trim();
    parseTypes(interfaceStr.substring(interfaceStr.indexOf('{') + 1, interfaceStr.lastIndexOf('}')).trim(), obj);
    
    return { name, obj }
}

const parseTypes = (types, obj) => {
    let level = 0;
    for(let i = 0; i < types.length; i++) {
        if(types[i] === '{') {
            level += 1; 
        } else if(types[i] === '}') {
            level -= 1;
        }
        if(types[i] === ';' && level) {
            types = `${types.substring(0, i)},${types.substring(i + 1)}`;
        }
    }
    const props = types.split(';').map(prop => prop.trim());
    props.forEach(prop => {
        if(!prop) return;
        let isOptional = false;

        let propName = prop.substring(0, prop.indexOf(':')).trim();
        if(propName.slice(-1) === '?') {
            propName = propName.slice(0, -1);
            isOptional = true;
        }

        let propType = prop.substring(prop.indexOf(':') + 1).trim();
        
        if(simpleTypes.includes(propType)) {
            obj[propName] = isOptional ? `${propType}|optional` : propType;
        } else if(propType.slice(-1) === ']' || propType.indexOf('Array') === 0) {
            let itemType;
            if(propType.slice(-1) === ']') {
                itemType = propType.substring(0, propType.lastIndexOf('[')).trim();
            } else {
                itemType = propType.substring(propType.indexOf('<') + 1, propType.lastIndexOf('>')).trim();
            }

            if(!simpleTypes.includes(itemType)) {
                if(itemType[0] === '{' && itemType.slice(-1) === '}') {
                    while(itemType.indexOf(',') > -1) {
                        itemType = itemType.replace(',', ';');
                    }
                    obj[propName] = {
                        type: 'array',
                        items: {
                            type: "object",
                            props: {}
                        },
                        optional: isOptional
                    }
                    parseTypes(itemType.substring(1, itemType.length - 1).trim(), obj[propName].items.props);
                } else {
                    //TODO type is another interface
                    obj[propName] = {
                        type: 'array',
                        items: itemType,
                        optional: isOptional
                    }
                }
            } else {
                obj[propName] = {
                    type: 'array',
                    items: itemType,
                    optional: isOptional
                }
            }
        } else if(propType[0] === '{' && propType.slice(-1) === '}') {
            while(propType.indexOf(',') > -1) {
                propType = propType.replace(',', ';');
            }
            obj[propName] = {
                type: 'object',
                props: {},
                optional: isOptional
            }
            parseTypes(propType.substring(1, propType.length - 1).trim(), obj[propName].props);
        }
    });

    //TODO generic interface
    //TODO multiple type 
}

const generateInterfaces = async () => {
    let input = '.interface.ts';

    const filePaths = await getFilesRecursive(cwd());
    const interfacePaths = filePaths.filter(path => path.indexOf(input) > -1);

    for(let i = 0; i < interfacePaths.length; i++) {
        const path = interfacePaths[i];
        const interfaceAsJSON = await interface2obj(path);
        result[interfaceAsJSON.name] = interfaceAsJSON.obj;
    }

    return result;
}

module.exports = generateInterfaces;