import Head from 'next/head'
import { Inter } from 'next/font/google'
import Layout from '@/components/layout'
import styles from '@/styles/Home.module.css'
import Link from 'next/link'
import Image from 'next/image'
import { ImageList, ImageListItem } from '@mui/material'

const inter = Inter({ subsets: ['latin'] })

const itemData = [
  {
    img: '1.jpg',
    title: 'kedarnath1',
    cols: 2,
    rows: 2
  },
  {
    img: '4.jpg',
    title: 'kedarnath4',
    cols: 1,
    rows: 1
  },
  {
    img: '3.jpg',
    title: 'kedarnath3',
    cols: 1,
    rows: 1
  },
  {
    img: '2.jpg',
    title: 'kedarnath2',
    cols: 1,
    rows: 1
  }
];

export default function Home() {
  return (
    <Layout>
      <Head>
        <title>Kedarnath Seva Samithi Siddipet</title>
        <meta name="description" content="This is a portal for kedarntah annadana seva samithi siddipet" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ImageList cols={3} gap={15} sx={{margin: 2, overflow: 'hidden'}}>
        {itemData.map((item) => (
          <ImageListItem key={item.img} cols={item.cols}
          rows={item.rows}>
            <img
              src={`${item.img}?w=164&h=164&fit=crop&auto=format`}
              // srcSet={`${item.img}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
              alt={item.title}
              loading="lazy"
              className={styles.mainpageimage}
            />
          </ImageListItem>
        ))}
      </ImageList>
      {/* <main className={styles.main}>
        <div className={styles.header}>
            <Image src='/kedarnath_profile.jpg' width={100} height={100}></Image>
            <Link href="/" className={styles.link}>Home</Link>
            <Link href='/about' className={styles.link}>About</Link>
        </div>
      </main> */}
    </Layout>
  )
}
