var fs = require('fs');

var Constants = {  
    Chapter:'Chapter',
    ChapterLen : 7,

    Section : 'Section',
    SectionLen : 7,
};

var GetSectionPoint = (function GetSectionPoint($txt , $entityInitIndex , $entity = ':') {
  for (let j = $entityInitIndex; j < $txt.length; j++) {
      var elt = $txt[j];
      if(elt == $entity){
        var init = $entityInitIndex + Constants.SectionLen , end =  (j  - $entityInitIndex) - Constants.SectionLen;
        return ([ $txt.substr( init , end) , init + end + 1 ]);
      }
  }
})

var getPageNotation = (function getPageNotation($txt , $entityInitIndex) {
  for (let i = $entityInitIndex; i < $txt.length; i++) {
      var ent = $txt[i] , entBy1 = $txt[i + 1] , entBy2 =  $txt[i + 2], /*Because We don't have number greater then 3 digit*/
          num = ent+entBy1+entBy2;
        if(num == 'Sec'){
           var backward = i;
           while($txt[backward] !== '.'){
              backward = backward - 1;
           }
           return $txt.substr(backward  + 1, (i - backward) - 1 )
        }
  }
});


var GetTitle = function GetTitle($txt , $entityEndingIndex , SectionalInit){
  for (let i = $entityEndingIndex; i < $txt.length; i++) {
    var ent = $txt[i] , entBy1 = $txt[i + 1] , entBy2 =  $txt[i + 2], 
        num = ent+entBy1+entBy2;
      if(num == '...'){
         var backward = i;
         while($txt[backward] !== ':'){
             backward = backward - 1;
         }
         var Extract = $txt.substr(backward  + 1 , (i  - backward) -1 );
         if(Extract && Extract.indexOf('.') == -1){
           return(Extract)
         }
      }
  }
};

var getMyParent = (function getMyParent(collection , len){
    for (var i = 0; i < collection.length; i++) {
        var element = collection[i];
        if(element.TARGET_POINT  == len - 1){
          return i;
        }
    }
});

//Chapter
try {  
    var data = fs.readFileSync('data.txt', 'utf8') , txt = data.toString();
    
    var sec = false , JsonHub = [];
    for (let index = 0; index < data.length; index++) {
      var Chapter = txt.substr(index , 7), jsonOneUnit = {};
      
      if(Chapter == Constants.Chapter){
        sec = true;
        var result = GetSectionPoint(txt , index), title = GetTitle(txt , result[1] , index) , ChapterPoint = result[0];
        /* Get page Number getPageNotation(txt , ChapterPointingPoint[1])*/ 
        jsonOneUnit['TARGET_POINT'] =  JsonHub.length;
        jsonOneUnit['title'] = title.trim();
        jsonOneUnit['page']  = ChapterPoint.trim();
        jsonOneUnit['subs']  = [];
        JsonHub.push(jsonOneUnit);
      }
      if(sec){
        var jsonbaby = {};
        if(Chapter == Constants.Section){
            secInner = true;
            var result = GetSectionPoint(txt , index) , title = GetTitle(txt , result[1] , index) , ChapterPoint = result[0];
            var MyParentIndex = getMyParent(JsonHub , JsonHub.length);
            jsonbaby['title'] = title.trim();
            jsonbaby['page']  = ChapterPoint.trim();
            JsonHub[MyParentIndex]['subs'].push(
              jsonbaby
            );
        }
      } 
    }
    var Output = JSON.stringify(JsonHub);
    console.log(Output)
} catch(e) {
    console.log('Error:', e.stack);
}