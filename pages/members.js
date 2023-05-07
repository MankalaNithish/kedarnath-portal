import Layout from "@/components/layout";
import MemberContact from "@/components/member-contact";
import styles from "@/styles/Home.module.css";
import { Grid } from "@mui/material";
import totalMembers from "@/pages/data/members.json";
const { honMems, mainMems, commiteeMems, members } = totalMembers;

export default function Members() {
    return (
        <Layout>
            <div className={styles.container}>
                <div className={styles.heading}>
                    Kedarnath Annadana Seva Samithi - Siddipet Regd. No. 4/2020
                </div>
                <div className={styles.gridcontainer}>
                    <span className={styles.gridheading}>Hon&apos;ble Members</span>
                    <Grid container spacing={2} columns={9} className={styles.grid}>
                        {honMems.map((mem, index) => (
                            <Grid item xs={9} md={3} key={index}>
                                <MemberContact member={mem}
                                    avatar={true}>
                                </MemberContact>
                            </Grid>
                        ))}
                    </Grid>
                </div>
                <div className={styles.gridcontainer}>
                    <span className={styles.gridheading}>Main Body</span>
                    <Grid container spacing={2} columns={9} className={styles.grid}>
                        {mainMems.map((mem, index) => (
                            <Grid item xs={9} md={3} key={index}>
                                <MemberContact member={mem}
                                    avatar={true}>
                                </MemberContact>
                            </Grid>
                        ))}
                    </Grid>
                </div>
                <div className={styles.gridcontainer}>
                    <span className={styles.gridheading}>Committee Members</span>
                    <Grid container spacing={2} columns={9} className={styles.grid}>
                        {commiteeMems.map((mem, index) => (
                            <Grid item xs={9} md={3} key={index}>
                                <MemberContact member={mem}
                                    avatar={true}>
                                </MemberContact>
                            </Grid>
                        ))}
                    </Grid>
                </div>
                <div className={styles.gridcontainer}>
                    <span className={styles.gridheading}>Members</span>
                    <Grid container spacing={2} columns={9} className={styles.grid}>
                        {members.map((mem, index) => (
                            <Grid item xs={9} md={3} key={index}>
                                <MemberContact member={mem}
                                    avatar={true}>
                                </MemberContact>
                            </Grid>
                        ))}
                    </Grid>
                </div>
            </div>
        </Layout>
    )
}