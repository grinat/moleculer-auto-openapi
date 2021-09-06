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

const getImports = (interfaceStr, interfacePath) => {
    return interfaceStr
        .substring(0, interfaceStr.lastIndexOf('interface'))
        .trim()
        .split(';')
        .filter(str => str.indexOf('import') > -1)
        .map(str => {
            str.trim();
            let name = str.substring(str.indexOf('{') + 1, str.indexOf('}')).trim();
            name = name.indexOf(' as ') > -1 ? name.split(' as ')[1].trim() : name;
            let path = str.slice(str.indexOf('from') + 6, -1).trim();
            path = path.startsWith('./') || path.startsWith('../') ? `${join(interfacePath, '../', path)}.ts` : `${path}.ts`;
            return { name, path }
        });
}

const interface2obj = async (path, obj = {}) => {
    let interfaceStr = await (await readFile(path)).toString();
    let imports = getImports(interfaceStr, path);
    interfaceStr = interfaceStr.slice(interfaceStr.lastIndexOf('interface'));
    const name = interfaceStr.substring(interfaceStr.indexOf('interface') + 10, interfaceStr.indexOf('{')).trim();
    await parseTypes(interfaceStr.substring(interfaceStr.indexOf('{') + 1, interfaceStr.lastIndexOf('}')).trim(), obj, imports);
    
    return { name, obj }
}

const parseTypes = async (types, obj, imports) => {
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
    for(let i = 0; i < props.length; i++) {
        let prop = props[i];
        if(!prop) return;
        let isOptional = false;

        let propName = prop.substring(0, prop.indexOf(':')).trim();
        if(propName.slice(-1) === '?') {
            propName = propName.slice(0, -1);
            isOptional = true;
        }

        let propType = prop.substring(prop.indexOf(':') + 1).trim();
        if(propType.indexOf('|') > -1) {
            propType
                .split('|')
                .map(x => x.trim())
                .forEach(x => {
                    if(x === 'undefined' || x === 'null') {
                        isOptional = true;
                        return;
                    }
                    propType = x;
                });
        }
        
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
                    await parseTypes(itemType.substring(1, itemType.length - 1).trim(), obj[propName].items.props, imports);
                } else {
                    //TODO type is another interface
                    obj[propName] = {
                        type: 'array',
                        items: {},
                        optional: isOptional
                    }
                    const imported = imports.find(x => x.name === itemType);
                    if(!imported) return;
                    await interface2obj(imported.path, obj[propName].items);
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
            await parseTypes(propType.substring(1, propType.length - 1).trim(), obj[propName].props, imports);
        } else {
            obj[propName] = {
                type: 'object',
                props: {},
                optional: isOptional
            }
            const imported = imports.find(x => x.name === propType);
            if(!imported) return;

            await interface2obj(imported.path, obj[propName].props);
        }
    }

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