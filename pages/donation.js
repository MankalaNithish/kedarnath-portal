import Layout from "@/components/layout";
import { Paper } from "@mui/material";
import styles from '@/styles/Home.module.css';

export default function Donation() {
    return (
        <Layout>
            <Paper width="90%" style={{marginTop: '5%'}}>
                <div style={{display: 'flex', justifyContent: 'center'}}>
                    <span style={{fontSize: '30px', fontWeight: 'bold', color:'#1976d2'}}>Please scan this QR for donations</span>
                </div>
                <div style={{display: 'flex', justifyContent: 'center'}}>
                    <img width="90%" src={'/qrcode.jpeg'}>
                    </img>
                </div>
            </Paper>
        </Layout>
    )
}