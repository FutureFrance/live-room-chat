import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';

process.on("message", (payload: {tempFilePath: string, fileName: string}) => {  
    const { tempFilePath, fileName } = payload;

    const endProcess = (infoMessage: string) => {          
        fs.unlink(tempFilePath, (err) => {    
            if (err && process.send) {      
                process.send("Compressing Error");    
            }  
        });  
        if (process.send) process.send(infoMessage);  
        
        process.exit();
    };

    ffmpeg(tempFilePath)
        .fps(30)  
        .addOptions(["-crf 28"])  
        .on("end", () => {     
            endProcess("Success");  
        })  
        .on("error", (err) => {    
            endProcess(err.message);  
        }).save(`./static/${fileName}`);
});