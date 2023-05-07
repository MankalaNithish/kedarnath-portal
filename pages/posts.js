import Layout from "@/components/layout";
import { Box, Button, CardContent, CardHeader, Container, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Icon, ImageList, ImageListItem, Input, Paper, TextField } from "@mui/material";
import styles from '@/styles/Home.module.css';
import postStyles from '@/styles/Post.module.css';
import OverflowText from "@/components/overflowtext";
import { useEffect, useState } from "react";
import axios from 'axios';
import environment from "@/environment";
import CreateIcon from '@mui/icons-material/Create';
import PostImage from "@/components/postimage";

const posts = [
    {
        date: '2023-04-29',
        description: 'Today at annadanam1',
        images: [
            'kedarnath_29_03_2023.jpeg'
        ]
    },
    {
        date: '2023-04-29',
        description: 'Today at annadanam2',
        images: [
            'kedarnath_29_03_2023.jpeg',
            'kedarnath_29_03_2023.jpeg'
        ]
    },
    {
        date: '2023-04-29',
        description: `నమస్కారం!
            అందరు క్షేమమేనా?`,
        images: [
            'kedarnath_29_03_2023.jpeg',
            'kedarnath_29_03_2023.jpeg',
            'kedarnath_29_03_2023.jpeg'
        ]
    },
    {
        date: '2023-04-29',
        description: `The most glorious of the world-renowned pilgrimages is the most difficult of all.
        Kedhariswaram is the most famous Mahayatra shrine among the Dwadasha Jyotirlingas.  During the Jyotirlinga Mahadarshan Yatra, lakhs of people from many countries, states, districts, towns and villages come and go to visit this place of pilgrimage.  God, Mahadev, who is called upon to protect all living beings, to bless devotees for the welfare of the world in the form of the creator of creation, the chief of wealth, the savior, the Mahalinga.  Kedharinath, the holy place where Lord Shiva appeared, is the best place for spiritual contemplation, meditation and meditation. For the convenience of the devotees of Kedarnath Yatra, Annadanam is a great gift.
        <br/><br/>
        As the only Telugu food donation camp in Telangana state in South India, we are conducting it under the joint auspices of Shri Kedharnath Langar Committee Jalandhar and Kedharnath Annadana Seva Samiti, Siddipet.  It is no exaggeration to say that the definition of satisfaction is food, and there is no other great gift beyond food in this Kali Yuga.  We have started this holy program considering the preservation of all the crores of people as human service as Mahesh&apos;s service as Kedareshwar&apos;s service.  Annadanam is an easy time for salvation for devotees to take human birth.  All the devotees receive Annaprasad in the presence of Lord Kedareshwar and after seeing the happiness they get, they get the full grace of Lord Shiva.  We sincerely invite every devotee to participate in this holy food donation program with their own devotion to this huge holy food donation camp.`,
        images: [
            'kedarnath_29_03_2023.jpeg',
            'kedarnath_29_03_2023.jpeg',
            'kedarnath_29_03_2023.jpeg',
            'kedarnath_29_03_2023.jpeg'
        ]
    },
    {
        date: '2023-04-29',
        description: `The most glorious of the world-renowned pilgrimages is the most difficult of all.
        Kedhariswaram is the most famous Mahayatra shrine among the Dwadasha Jyotirlingas.  During the Jyotirlinga Mahadarshan Yatra, lakhs of people from many countries, states, districts, towns and villages come and go to visit this place of pilgrimage.  God, Mahadev, who is called upon to protect all living beings, to bless devotees for the welfare of the world in the form of the creator of creation, the chief of wealth, the savior, the Mahalinga.  Kedharinath, the holy place where Lord Shiva appeared, is the best place for spiritual contemplation, meditation and meditation. For the convenience of the devotees of Kedarnath Yatra, Annadanam is a great gift.
        <br/><br/>
        As the only Telugu food donation camp in Telangana state in South India, we are conducting it under the joint auspices of Shri Kedharnath Langar Committee Jalandhar and Kedharnath Annadana Seva Samiti, Siddipet.  It is no exaggeration to say that the definition of satisfaction is food, and there is no other great gift beyond food in this Kali Yuga.  We have started this holy program considering the preservation of all the crores of people as human service as Mahesh&apos;s service as Kedareshwar&apos;s service.  Annadanam is an easy time for salvation for devotees to take human birth.  All the devotees receive Annaprasad in the presence of Lord Kedareshwar and after seeing the happiness they get, they get the full grace of Lord Shiva.  We sincerely invite every devotee to participate in this holy food donation program with their own devotion to this huge holy food donation camp.`
    },
    {
        images: []
    },
    {
        images: []
    },
    {
        images: []
    },
    {
        images: []
    }
];

const cols = [1, 2, 2, 2];
const rows = [1, 1, 2, 2];

export default function Posts() {

    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [open, setOpen] = useState(false);
    const [files, setFiles] = useState(null);
    const [description, setDescription] = useState('');
    const postIds = [];

    async function getPosts() {
        return await axios(`${environment.apiUrl || ''}/api/v1/posts?limit=${10}&skip=${page*10}&sort={"_id":-1}`);
    }

    const fetchData = async () => {
        setIsLoading(true);
        try {
            let response = await getPosts();
            let slicedPosts = response.data;
            let postsToInsert = [];
            slicedPosts.forEach(post => {
                if (!postIds.includes(post._id.toString())) {
                    postIds.push(post._id.toString());
                    postsToInsert.push(post);
                }
            });
            setData(prevData => [...prevData, ...postsToInsert]);
            setPage(prevPage => prevPage + 1);
            setIsLoading(false);
        } catch(e) {
            console.error(e);
            return alert('We are unable to get the posts');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        console.log({ scrollTop, scrollHeight, clientHeight })
        console.log(scrollTop + clientHeight >= scrollHeight - 5)
        console.log(isLoading)
        if (scrollTop + clientHeight >= scrollHeight - 5 && !isLoading) {
            console.log(333)
          fetchData();
        }
    };
    
    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [isLoading]);

    function handleFileChange(event) {
        setFiles(event.target.files || []);
    }

    function openModal() {
        setOpen(true);
    }

    function closeModal() {
        setOpen(false);
        setDescription('');
        setFiles(null);
    }

    async function submitPost() {
        const formData = new FormData();
        formData.append('description', description);
        for (let i = 0; i < files.length; i++) {
            formData.append("images", files[i]);
        }
        await axios.post('/api/v1/createPost', formData);
        closeModal();
    }

    function isLoggedIn() {
        return typeof window !== 'undefined' && sessionStorage.getItem('isLoggedIn');
    }

    return(
        <Layout>
            <div className={postStyles.postsContainer}>
                {data.map((post, index) => (
                    <Paper sx={{width: {xs: '90%', md: '60%', lg: '40%'}}}
                        className={styles.postCard}
                        key={index}
                        elevation={8}
                        >
                        <CardHeader
                            title='Kedarnath Annadana Seva Samithi'
                            subheader={post.date && new Date(post.date).toDateString()}
                        >
                        </CardHeader>
                        <Divider/>
                        <CardContent>
                            {post.images && post.images.length &&
                            <PostImage images={post.images} style={{maxWidth: '400px'}}/> }
                            <div className={postStyles.postDescription}>
                                <OverflowText text={post.description} maxLength={180}/>
                            </div>
                        </CardContent>
                        <Divider/>
                        <div className={postStyles.postFooter}>
                            <span style={{float:'right'}}>
                                By Nischith Kumar Mankala
                            </span>
                        </div>
                    </Paper>
                ))}
                {isLoggedIn() ? 
                <Container maxWidth='lg'>
                    <Box sx={{display: {xs: 'none', md: 'flex'}}}>
                        <Button className={postStyles.addPost} onClick={openModal}>Add Post</Button>
                    </Box>
                    <Box sx={{display: {xs: 'flex', md: 'none'}}}>
                        <CreateIcon className={postStyles.addPost} onClick={openModal}></CreateIcon>
                    </Box>
                </Container>
                : <></>}
            </div>
            {isLoading && <p>Loading...</p>}
        <Dialog open={open}>
            <DialogTitle>Add Post</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    id="description"
                    label="Post Description"
                    fullWidth
                    variant="standard"
                    onChange={(event) => setDescription(event.target.value)}
                    className={postStyles.descInput}
                />
                <Input
                    type="file"
                    inputProps={{accept: 'image/jpeg, image/png, image/jpg', multiple: true}}
                    placeholder="Add the photos"
                    onChange={handleFileChange}
                    >
                </Input>
                <DialogActions>
                    <Button onClick={closeModal}>Cancel</Button>
                    <Button onClick={submitPost}>Post</Button>
                </DialogActions>
            </DialogContent>
        </Dialog>
        </Layout>
    )
}