class Construct{
    protected static tabs = "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t";

    constructor(protected name: string){
        this.name = name;
    }

    public toRobot(tab: number): string{
        return Construct.tabs.substr(0, tab)  + `${this.name}`
    }
    
}

class Task extends Construct{

    constructor(private id: number, name: string, public child: Array<Task> = []){
        super(name);
        this.id = id;
        this.child = child;
    }

    public setName(name: string): any {
        this.name = name
    }

    public delChild(delList: any, child: any) {
        delList.forEach((id: string) => {
            let delTask
            delTask = child.find((obj: any) => obj.id == id)
            if (delTask != null) {
                child = child.filter((obj: any) => obj.id != id)
            } else {
                child.forEach((obj: any) => {
                    obj.child = this.delChild([id], obj.child)
                })
            }
        })
        return child
    }

    public findChildTask(id: any, child: any) {
        let childTask
        childTask = child.find((obj: any) => obj.id == id)
        if (childTask == null) {
            child.forEach((obj: any) => {
                childTask = this.findChildTask(id, obj.child)
            })
        }
        return childTask
    }

    public setProperty(value: any) {
    }

    public alignChild(child: any) {
        let newChild = child.sort((a: any, b: any) => {
            return a.x - b.x
        })
        return newChild
    }

    public clone():any {

        let cloneObj = Object.create(this);
       // var cloneObj = new (this.constructor() as any)(this.id, this.name);
        // cloneObj.id = id;
        // cloneObj.name = name;
        // for (var attribut in this) {
        // if (typeof this[attribut] === "object") {
        //     cloneObj[attribut] = this[attribut].clone();
        // } else {
        //     cloneObj[attribut] = this[attribut];
        // }
    
       return cloneObj;
    }   
}

class CallKeyword extends Construct{
    public inputVariableNames: string[] = ["a","b", "c"];
    public outputVariableName: string = "invitations";

   
    public toRobot(tab: number): string{
        let robot = Construct.tabs.substr(0, tab);
        
        if(this.outputVariableName)
            robot += "${" + this.outputVariableName + "} = ";
        
        robot 
            += `${this.name} `;

        if(this.inputVariableNames){
            this.inputVariableNames.forEach(inputVarName => {
                robot += "${" + inputVarName + "} ";
            })
        }

        return robot;
    }
     
}

class SeqTask extends Task{


    public toRobot(tab: number): string{

        let robot = super.toRobot(tab);

        
        this.child?.forEach(child=> robot += "\n"+child.toRobot(tab + 1));

        robot += "\n"+Construct.tabs.substr(0, tab)+"END";
        

        return robot; 
    }
}

class ForTask extends SeqTask{

    public itemVarName: string = "item";
    public iterationVarName: string = "items";

    public setProperty(value: any) {
        this.itemVarName = value.itemVarName
        this.iterationVarName = value.iterationVarName
    }

   
    public toRobot(tab: number): string{
        const name = this.name.toUpperCase()

        let robot = Construct.tabs.substr(0, tab) + `${name} \$\{${this.itemVarName}\} IN \$\{${this.iterationVarName}\}`

        this.child?.forEach(child=> robot += "\n"+child.toRobot(tab + 1));

        robot += "\n"+Construct.tabs.substr(0, tab)+"END";

        return robot; 
    }

}

class IfTask extends SeqTask{

    public conditions: any[] = []

    public setProperty(value: any) {
        this.conditions = value.conditions
    }
    
    public toRobot(tab: number): string{
        const name = this.name.toUpperCase()

        let robot = Construct.tabs.substr(0, tab) + `${name}` + Construct.tabs.substr(0, tab);

        if (this.conditions.length > 0) {
            let ifCondition = this.conditions.find((obj) => obj.type == 'If')
            if(!ifCondition) { 
                robot += Construct.tabs.substr(0, tab)+"END";
                return robot
            }
            if(ifCondition.operator) {
                robot += ifCondition.variable + ' ' + ifCondition.operator + ifCondition.compareVariable+ ' ' +'\n'
            } else {
                robot += ifCondition.variable + '\n'
            }
            ifCondition.keywords?.forEach((keyword: string)=> robot += Construct.tabs.substr(0, tab+1) + keyword + '\n')

            let elseifCondition = this.conditions.filter((obj) => obj.type == 'Else If')
            if(!elseifCondition) {
                robot += Construct.tabs.substr(0, tab)+"END";
                return robot
            }
            elseifCondition?.forEach((condition: any)=> {
                robot += Construct.tabs.substr(0, tab) + condition.type + Construct.tabs.substr(0, tab+1)
                if(condition.operator) {
                    robot += condition.variable + ' ' + condition.operator + condition.compareVariable+ ' ' +'\n'
                } else {
                    robot += condition.variable + '\n'
                }
                condition.keywords?.forEach((keyword: string)=> robot += Construct.tabs.substr(0, tab+1) + keyword + '\n')
            })

            let elseCondition = this.conditions.find((obj) => obj.type == 'Else')
            if(!elseCondition) {
                robot += Construct.tabs.substr(0, tab)+"END";
                return robot
            }
            robot += Construct.tabs.substr(0, tab) + elseCondition.type + '\n'
            elseCondition.keywords?.forEach((keyword: string)=> robot += Construct.tabs.substr(0, tab+1) + keyword + '\n')
            
            robot += Construct.tabs.substr(0, tab) + "END"
        }
        
        return robot; 
    }

}

class WhileTask extends SeqTask{

    public condition: any = null
    public limit: string = "";

    public setProperty(value: any) {
        this.condition = value.condition
        this.limit = value.limit
    }
    
    public toRobot(tab: number): string{
        const name = this.name.toUpperCase()

        let robot = Construct.tabs.substr(0, tab) + `${name}`;

        if (this.condition != null) {
            robot += this.condition.variable
            if (this.condition.operator) {
                robot += ' ' + this.condition.operator + ' ' + this.condition.compareVariable
            }
        }
        if (this.limit != '') {
            robot += ' limit=' + this.limit + '\n'
        }
        this.child?.forEach(child=> robot += "\n"+child.toRobot(tab + 1));

        robot += '\n' + Construct.tabs.substr(0, tab) + "END";

        return robot; 
    }

}

class Robot extends SeqTask{

    private variables: Variable[] = [];
    public keywords: Keyword[] = [];


    public toRobot(tab: number): string{
        let robot = "*** Variables ***\n";
        
        this.variables.forEach(
            variable => robot += variable.toRobot(tab+1)
        );

        robot+="*** Tasks ****\n";

        robot+=super.toRobot(tab) + "\n";

        robot+="*** Keywords ****\n";

        this.keywords.forEach(keyword => robot += keyword.toRobot(tab));

        return robot;
    }

}

class Variable extends Construct{

    public constructor(public name: string, public defaultValue: string){
        super(name);
        this.defaultValue = defaultValue;
    }

}

class Keyword extends SeqTask{

}

export{Robot, Task, SeqTask, ForTask, IfTask, WhileTask, Keyword, CallKeyword}