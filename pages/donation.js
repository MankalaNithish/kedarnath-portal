import Layout from "@/components/layout";
import { Paper } from "@mui/material";

export default function Donation() {

    function downloadQRImage(imageUrl, filename) {
        const link = document.createElement("a");
        link.href = imageUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <Layout>
            <Paper width="90%" style={{marginTop: '5%'}}>
                <div style={{display: 'flex', justifyContent: 'center'}}>
                    <span style={{fontSize: '30px', fontWeight: 'bold', color:'#1976d2'}}>
                        Please scan this QR for donations
                    </span>
                </div>
                <div style={{display: 'flex', justifyContent: 'center'}}>
                    <a style={{textDecorationLine: 'underline', color: 'blue', cursor: 'pointer'}}
                        onClick={() => downloadQRImage('/qrcode.jpeg', 'Kedarnath QR Code.jpeg')}>
                        Click here to download the QR code
                    </a>
                </div>
                <div style={{display: 'flex', justifyContent: 'center'}}>
                    <img width="90%" src={'/qrcode.jpeg'}>
                    </img>
                </div>
            </Paper>
        </Layout>
    )
}