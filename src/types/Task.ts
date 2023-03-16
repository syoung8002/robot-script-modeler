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
        let robot = Construct.tabs.substr(0, tab) ;
        
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

   
    public toRobot(tab: number): string{

        let robot = Construct.tabs.substr(0, tab)  + `${this.name} \$\{${this.itemVarName}\} IN \$\{${this.iterationVarName}\}`

        
        this.child?.forEach(child=> robot += "\n"+child.toRobot(tab + 1));

        robot += "\n"+Construct.tabs.substr(0, tab)+"END";
        

        return robot; 
    }

}

class IfTask extends SeqTask{


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

export{Robot, Task, SeqTask, ForTask, IfTask, Keyword, CallKeyword}