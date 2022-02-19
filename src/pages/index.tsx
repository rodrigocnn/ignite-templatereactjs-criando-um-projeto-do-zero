import { useEffect, useState } from 'react';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import Prismic from '@prismicio/client';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

import { AiOutlineCalendar } from 'react-icons/ai';
import {BiUser} from 'react-icons/bi'


interface Post {
 
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
  preview: boolean;
}

 export default function Home({postsPagination}:HomeProps) {

  const [posts, setPosts] = useState<Post[]>([]);
  const [nextPage, setNextPage] = useState('');

  useEffect(() => {
    setPosts(postsPagination.results);
    setNextPage(postsPagination.next_page);
  }, [postsPagination.results, postsPagination.next_page]);

  function handlePagination(): void {
    fetch(nextPage)
      .then(res => res.json())
      .then(data => {
        const formattedData = data.results.map(post => {
          return {
            uid: post.uid,
            first_publication_date: post.first_publication_date,
            data: {
              title: post.data.title,
              subtitle: post.data.subtitle,
              author: post.data.author,
            },
          };
        });

        setPosts([...posts, ...formattedData]);
        setNextPage(data.next_page);
      });
  }

  console.log('Posts', posts)

  return (
    <div className={styles.container}>
       
       { posts?.map(post => (
              
              <Link key={post.uid}  href={`/post/${post.uid}`}>
                <a >
                  <div  className={styles.postContainer}>
                      <h2>{post.data.title}</h2>
                      <p>{post.data.subtitle}</p>
                      <div className={styles.postInfo}>
                        <p><AiOutlineCalendar /> {new Date(post.first_publication_date).toLocaleDateString('pt-BR', {
                        day:'2-digit',
                        month: 'short',
                        year: 'numeric'
                      })  }</p>
                        <p><BiUser/> {post.data.author}</p>
                      </div>
                  </div>
                </a>
              </Link>
          ))}

        {nextPage && (
            <button onClick={handlePagination} >
              Carregar mais posts 
            </button>
          )}
         
    </div>

    
  )
 }

 export const getStaticProps = async () => {
 
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
  [Prismic.predicates.at('document.type', 'post')],
  {
    fetch: ['post.title', 'post.subtitle', 'post.author'],
    pageSize: 1,
   
  }
);

  const posts = postsResponse.results.map((post)=>{
      return{
        uid: post.uid,
        first_publication_date:  post.first_publication_date,
     
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
      }
  })

 
  return {
    props:{
      postsPagination: {
        next_page: postsResponse.next_page,
        results: posts,
      },
    }
  }

 };
