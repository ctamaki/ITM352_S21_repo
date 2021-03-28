function checkit (item,index){
    console.log(`part ${index} is ${(isNonNegInt(item)?'a':'not a')} quantity`);
}

attributes = "Chayse;21;MIS/Marketing/Entrepreneurship";
parts = attributes.split(";")

