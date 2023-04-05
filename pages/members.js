import Layout from "@/components/layout";
import MemberContact from "@/components/member-contact";
import styles from "@/styles/Home.module.css";
import { Grid } from "@mui/material";

const honMems = [
    {
        name: 'Sri Thanneru Harish Rao',
        phone: '9866199999',
        designation: 'Telangana State Finance & Health Minister',
        picName: 'harishrao'
    },
    {
        name: 'Sri Kotha Prabhakar Reddy',
        phone: '9849037800',
        designation: 'Member of Parliament Medak',
        picName: 'kothaprabhakar'
    },
    {
        name: 'Sri Kadavergu Rajanarsu',
        phone: '9440859219',
        designation: 'Ex-Municipal Chairperson, Siddipet'
    }
];

const mainMems = [
    {
        name: 'Cheekoti Madhusudhan',
        phone: '9949930005',
        designation: 'President'
    },
    {
        name: 'Aitha Ratnakar',
        phone: '9246932267',
        designation: 'General Secretary'
    },
    {
        name: 'Gopishetty Sharabaiah',
        phone: '9848124031',
        designation: 'Treasurer'
    }
];

const memberDetails = [
    {
        name: 'Kacham Kashinath',
        phone: '9848423408',
        designation: 'Vice President'
    },
    {
        name: 'Shivva Srinivas(Nandini)',
        phone: '9848124114',
        designation: 'Vice President'
    },
    {
        name: 'Ganji Ramulu',
        phone: '9440896151',
        designation: 'Vice President'
    },
    {
        name: 'Komuravelli Buchaiah',
        phone: '9246949272',
        designation: 'Vice President'
    },
    {
        name: 'Pujala Venkateshwar Rao (Chinna)',
        phone: '9440006266',
        designation: 'Secretary'
    },
    {
        name: 'Nalla Nagarajam',
        phone: '9866639367',
        designation: 'Secretary'
    },
    {
        name: 'Akula Srinivas(Anil)',
        phone: '9848091472',
        designation: 'Secretary'
    },
    {
        name: 'Gubba Lingamurthy',
        phone: '9440380261',
        designation: 'Secretary'
    },
    {
        name: 'Mankala Naveen Kumar',
        phone: '9440777741',
        designation: 'P.R.O'
    },
    {
        name: 'Lekharaj Kanchan Ramnani',
        phone: '9848036211',
        designation: 'Honorary Advisor'
    },
    {
        name: 'Dr. Ch. Ramchandar Rao (MBBS)',
        phone: '9866122865',
        designation: 'Honorary Advisor'
    }
];

const members = [
    {
        name: 'Kakkirala Ramesh',
        phone: '9849059314'
    },
    {
        name: 'Rachakonda Ashok',
        phone: '9346761550'
    },
    {
        name: 'Donthula Raju',
        phone: '98487737337'
    },
    {
        name: 'Gande Eshwarcharan',
        phone: '9848584451'
    },
    { 
        name: 'Thadakamadla Shekar',
        phone: '9885418292'
    },
    { 
        name: 'Ellendula Chandrashekar',
        phone: '9866690421',
    },
    {
        name: 'Cholleti Nagabhushanam',
        phone: '9440450840'
    },
    {
        name: 'Kaparthi Nagaraju',
        phone: '9441022136'
    },
    {
        name: 'Cheekoti Chandrashekar',
        phone: '9912381832'
    },
    {
        name: 'Kotha Srinivas',
        phone: '9963801862'
    },
    {
        name: 'Yama Veeresham',
        phone: '9391011123'
    },
    {
        name: 'Kyasa Srinivas',
        phone: '9849036309'
    },
    {
        name: 'T.V. Krishna',
        phone: '9849134112'
    },
    {
        name: 'Neerumalla Tirupathi',
        phone: '9440086788'
    },
    {
        name: 'Bukka Balnarayana',
        phone: '9849659511'
    },
    {
        name: 'Yellenki Ramesh',
        phone: '9848245125'
    },
    {
        name: 'Koduru Naga Vishweshwar',
        phone: '9949946889'
    },
    {
        name: 'Uppalancha Amarnath',
        phone: '9949045599'
    },
    {
        name: 'Thammishetty Ashok',
        phone: '9440844986'
    },
    {
        name: 'Yada Ashok',
        phone: '9246822788'
    },
    {
        name: 'Linga Ravindranath',
        phone: '9849009855'
    },
    {
        name: 'Aitha Eshwarcharan',
        phone: '9246960720'
    },
    {
        name: 'Gampa Ramesh',
        phone: '9440130167'
    },
    {
        name: 'Aitha Prabhakar',
        phone: '9348352449'
    },
    {
        name: 'Uppala Srinivas',
        phone: '9848090521'
    },
    {
        name: 'Jilla Srinivas',
        phone: '9848393244'
    }
];

export default function About() {
    return (
        <Layout>
            <div className={styles.container}>
                <div className={styles.heading}>
                    Kedarnath Annadana Seva Samithi - Siddipet Regd. No. 4/2020
                </div>
                <div className={styles.gridcontainer}>
                    <span className={styles.gridheading}>Hon&apos;ble Members</span>
                    <Grid container spacing={2} columns={9} className={styles.grid}>
                        {honMems.map(({name, phone, designation, picName}, index) => (
                            <Grid item xs={9} md={3} key={index}>
                                <MemberContact name={name}
                                    phone={phone}
                                    designation={designation}
                                    picname={picName}
                                    avatar={true}>
                                </MemberContact>
                            </Grid>
                        ))}
                    </Grid>
                </div>
                <div className={styles.gridcontainer}>
                    <span className={styles.gridheading}>Main Body</span>
                    <Grid container spacing={2} columns={9} className={styles.grid}>
                        {mainMems.map(({name, phone, designation, picName}, index) => (
                            <Grid item xs={9} md={3} key={index}>
                                <MemberContact name={name}
                                    phone={phone}
                                    designation={designation}
                                    picname={picName}
                                    avatar={true}>
                                </MemberContact>
                            </Grid>
                        ))}
                    </Grid>
                </div>
                <div className={styles.gridcontainer}>
                    <span className={styles.gridheading}>Committee Members</span>
                    <Grid container spacing={2} columns={9} className={styles.grid}>
                        {memberDetails.map(({name, phone, designation, picName}, index) => (
                            <Grid item xs={9} md={3} key={index}>
                                <MemberContact name={name}
                                    phone={phone}
                                    designation={designation}
                                    picname={picName}
                                    avatar={true}>
                                </MemberContact>
                            </Grid>
                        ))}
                    </Grid>
                </div>
                <div className={styles.gridcontainer}>
                    <span className={styles.gridheading}>Members</span>
                    <Grid container spacing={2} columns={9} className={styles.grid}>
                        {members.map(({name, phone, designation, picName}, index) => (
                            <Grid item xs={9} md={3} key={index}>
                                <MemberContact name={name}
                                    phone={phone}
                                    designation={designation}
                                    picname={picName}
                                    avatar={true}>
                                </MemberContact>
                            </Grid>
                        ))}
                    </Grid>
                </div>
                {/* <Grid container spacing={2} columns={9}>
                    {memberDetails.map(({name, phone, designation}, index) => (
                        <Grid item xs={9} md={3} key={index}>
                            <MemberContact name={name}
                                phone={phone}
                                designation={designation}
                                avatar={true}>
                            </MemberContact>
                        </Grid>
                    ))}
                </Grid> */}
            </div>
        </Layout>
    )
}