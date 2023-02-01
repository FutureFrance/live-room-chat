import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';

process.on("message", (payload: {tempFilePath: string, fileName: string}) => {  
    const { tempFilePath, fileName } = payload;
    const timestamp = Date.now();

    const endProcess = (infoMessage: string) => {          
        fs.unlink(tempFilePath, (err) => {    
            if (err && process.send) {      
                process.send({message: infoMessage, finalPath: `./static/${timestamp}${fileName}`});  
            }  
        });  
        if (process.send) process.send({message: infoMessage, finalPath: `./static/${timestamp}${fileName}`});  
        
        process.exit();
    };

    ffmpeg(tempFilePath)
        .fps(30)  
        .addOptions(["-crf 28"])  
        .on("end", () => {     
            endProcess("Success");  
        })  
        .on("error", () => {    
            endProcess("Error");  
        }).save(`./static/${timestamp}${fileName}`);
});