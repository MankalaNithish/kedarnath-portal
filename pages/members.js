import Layout from "@/components/layout";
import MemberContact from "@/components/member-contact";
import styles from "@/styles/Home.module.css";
import { Grid } from "@mui/material";

const honMems = [
    {
        name: 'Sri Thanneru Harish Rao',
        phone: '9866199999',
        designation: 'Telangana State Finance & Health Minister',
        place: 'Siddipet',
        picName: 'harishrao'
    },
    {
        name: 'Sri Kotha Prabhakar Reddy',
        phone: '9849037800',
        designation: 'Member of Parliament Medak',
        place: 'Hyderabad',
        picName: 'kothaprabhakar'
    },
    {
        name: 'Sri Kadavergu Rajanarsu',
        phone: '9440859219',
        designation: 'Ex-Municipal Chairperson, Siddipet',
        place: 'Siddipet',
    }
];

const mainMems = [
    {
        name: 'Cheekoti Madhusudhan',
        phone: '9949930005',
        designation: 'President',
        place: 'Siddipet',
        picName: 'cheekotimadhusudhan'
    },
    {
        name: 'Aitha Ratnakar',
        phone: '9246932267',
        designation: 'General Secretary',
        place: 'Siddipet',
    },
    {
        name: 'Gopishetty Sharabaiah',
        phone: '9848124031',
        designation: 'Treasurer',
        place: 'Siddipet',
    },
    {
        name: 'Mankala Naveen Kumar',
        phone: '9440777741',
        designation: 'P.R.O',
        place: 'Siddipet',
        picName: 'mankalanaveenkumar'
    }
];

const memberDetails = [
    {
        name: 'Kacham Kashinath',
        phone: '9848423408',
        designation: 'Vice President',
        place: 'Siddipet',
    },
    {
        name: 'Shivva Srinivas(Nandini)',
        phone: '9848124114',
        designation: 'Vice President',
        place: 'Siddipet',
    },
    {
        name: 'Ganji Ramulu',
        phone: '9440896151',
        designation: 'Vice President',
        place: 'Siddipet',
    },
    {
        name: 'Komuravelli Buchaiah',
        phone: '9246949272',
        designation: 'Vice President',
        place: 'Siddipet',
    },
    {
        name: 'Pujala Venkateshwar Rao (Chinna)',
        phone: '9440006266',
        designation: 'Secretary',
        place: 'Siddipet',
    },
    {
        name: 'Nalla Nagarajam',
        phone: '9866639367',
        designation: 'Secretary',
        place: 'Siddipet',
    },
    {
        name: 'Akula Srinivas(Anil)',
        phone: '9848091472',
        designation: 'Secretary',
        place: 'Siddipet',
    },
    {
        name: 'Gubba Lingamurthy',
        phone: '9440380261',
        designation: 'Secretary',
        place: 'Siddipet',
    },
    {
        name: 'Lekharaj Kanchan Ramnani (Karachi Bakery)',
        phone: '9848036211',
        designation: 'Honorary Advisor',
        place: 'Hyderabad',
    },
    {
        name: 'Dr. Ch. Ramchandar Rao (MBBS)',
        phone: '9866122865',
        designation: 'Honorary Advisor',
        place: 'Siddipet',
    }
];

const members = [
    {
        name: 'Gampa Srinivas',
        phone: '9848490774',
        place: 'Siddipet',
        picName: 'gampasrinivas'
    },
    {
        name: 'Kakkirala Ramesh',
        phone: '9849059314',
        place: 'Siddipet'
    },
    {
        name: 'Rachakonda Ashok',
        phone: '9346761550',
        place: 'Siddipet'
    },
    {
        name: 'Donthula Raju',
        phone: '98487737337',
        place: 'Siddipet',
        picName: 'donthularaju'
    },
    {
        name: 'Gande Eshwarcharan',
        phone: '9848584451',
        place: 'Siddipet'
    },
    { 
        name: 'Thadakamadla Shekar',
        phone: '9885418292',
        place: 'Siddipet'
    },
    { 
        name: 'Ellendula Chandrashekar',
        phone: '9866690421',
        place: 'Siddipet'
    },
    {
        name: 'Cholleti Nagabhushanam',
        phone: '9440450840',
        place: 'Siddipet'
    },
    {
        name: 'Kaparthi Nagaraju',
        phone: '9441022136',
        place: 'Siddipet'
    },
    {
        name: 'Cheekoti Chandrashekar',
        phone: '9912381832',
        place: 'Siddipet',
        picName: 'cheekotichandrashekar'
    },
    {
        name: 'Kotha Srinivas',
        phone: '9963801862',
        place: 'Medak',
        picName: 'kothasrinivas'
    },
    {
        name: 'Yama Veeresham',
        phone: '9391011123',
        place: 'Hyderabad'
    },
    {
        name: 'Kyasa Srinivasulu',
        phone: '9849036309',
        place: 'Hyderabad'
    },
    {
        name: 'T.V. Krishna',
        phone: '9849134112',
        place: 'Hyderabad'
    },
    {
        name: 'Neerumalla Thirupathi',
        phone: '9440086788',
        place: 'Karimnagar',
        picName: 'neerumallathirupathi'
    },
    {
        name: 'Bukka Balnarayana',
        phone: '9849659511',
        place: 'Karimnagar'
    },
    {
        name: 'Yellenki Ramesh',
        phone: '9848245125',
        place: 'Karimnagar'
    },
    {
        name: 'Koduru Naga Vishweshwar',
        phone: '9949946889',
        place: 'Vizag'
    },
    {
        name: 'Uppalancha Amarnath',
        phone: '9949045599',
        place: 'Hyderabad'
    },
    {
        name: 'Thammishetty Ashok',
        phone: '9440844986',
        place: 'Hyderabad'
    },
    {
        name: 'Yada Ashok',
        phone: '9246822788',
        place: 'Hyderabad'
    },
    {
        name: 'Linga Ravindranath',
        phone: '9849009855',
        place: 'Hyderabad'
    },
    {
        name: 'Aitha Eshwarcharan',
        phone: '9246960720',
        place: 'Siddipet'
    },
    {
        name: 'Gampa Ramesh',
        phone: '9440130167',
        place: 'Siddipet'
    },
    {
        name: 'Aitha Prabhakar',
        phone: '9348352449',
        place: 'Siddipet'
    },
    {
        name: 'Uppala Srinivas',
        phone: '9848090521',
        place: 'Siddipet'
    },
    {
        name: 'Jilla Srinivas',
        phone: '9848393244',
        place: 'Siddipet'
    },
    {
        name: 'Immadi Somanarsaiah',
        phone: '8374370370',
        place: 'Thonda Thirumalagiri'
    },
    {
        name: 'Chintha Rajendar',
        phone: '9052975182',
        place: 'Siddipet'
    },
    {
        name: 'Thatikonda Pattabhiram',
        phone: '9440265610',
        place: 'Hyderabad'
    },
    {
        name: 'Vemula Venkateshwarlu',
        phone: '9985047611',
        place: 'Athmakuru'
    },
    {
        name: 'Gattu Thirupathi Kishore',
        phone: '9491566842',
        place: 'Siddipet',
        picName: 'gattuthirupathi'
    },
    {
        name: 'Manepally Ramarao',
        phone: '9246546126',
        place: 'Hyderabad',
        picName: 'manepallyramarao'
    }
];

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
                        {memberDetails.map((mem, index) => (
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