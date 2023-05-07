import { Grid, ImageList, ImageListItem, Button } from "@mui/material";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";

export default function PostImage({images}) {
    const [index, setIndex] = useState(0);
    const totalImages = images.length;

    // const fileReader = new FileReader();
    // fileReader.readAsDataURL(Buffer.from(image.data, 'binary'));
    // fileReader.onloadend = () => {
    //     setImageURL(fileReader.result);
    // };

    function setImageIndex(type) {
        if (type === 'up') {
            setIndex(prevIndex => prevIndex + 1);
        }
        if (type === 'down') {
            setIndex(prevIndex => prevIndex - 1);
        }
    }

    return (
        <Grid container direction="row" spacing={1} columns={10}>
            <Grid item xs={1} style={{display: 'flex', margin: 'auto', justifyContent: 'center'}}>
                <Button
                    onClick={() => setImageIndex('down')}
                    disabled={index === 0}
                >
                    <ChevronLeft fontSize="large"/>
                </Button>
            </Grid>
            <Grid item xs={8}>
                <ImageList cols={1}>
                    <ImageListItem>
                        <img src={`data:${images[index].contentType};base64,${images[index].data}`}></img>
                    </ImageListItem>
                </ImageList>
            </Grid>
            <Grid item xs={1} style={{display: 'flex', margin: 'auto', justifyContent: 'center'}}>
                <Button
                    onClick={() => setImageIndex('up')}
                    disabled={index === totalImages - 1}
                >
                    <ChevronRight fontSize="large"/>
                </Button>
            </Grid>
        </Grid>
    )
}