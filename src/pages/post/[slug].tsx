import { GetStaticPaths, GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import { getPrismicClient } from '../../services/prismic';
import { AiOutlineCalendar } from 'react-icons/ai';
import { BiUser, BiTimeFive } from 'react-icons/bi';
import { useRouter } from 'next/router';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';


interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

 export default function Post({post}) {


  const router = useRouter();
  
  if (router.isFallback) {
    return <div>Carregando...</div>;
  }


      return(
        <div className={styles.postContent}>
           <img src={post.data.banner.url} alt={post.data.banner.alt} />
        
           <div  className={styles.postContainer}>
                      <h2>{post.data.title}</h2>
                      <p>{post.data.subtitle}</p>
                      <div className={styles.postInfo}>
                        <p><AiOutlineCalendar /> 
                          {new Date(post.first_publication_date).toLocaleDateString('pt-BR', {
                            day:'2-digit',
                            month: 'short',
                            year: 'numeric'
                          })  } </p>
                        <p><BiUser/> {post.data.author}</p>
                        <p><BiTimeFive/> 4 min</p>
                      </div>

                    {post.data.content.map(section => (
                          <section key={section.heading} className={styles.sectionContent}>
                            <h2>{section.heading}</h2>
                            <div
                              className={styles.content}
                              // eslint-disable-next-line react/no-danger
                              dangerouslySetInnerHTML={{
                                __html: RichText.asHtml(section.body),
                              }}
                        />
                      </section>
                    ))}

                  </div>

                

   
          </div>
   
      )
 }

 export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.Predicates.at('document.type', 'post')],
    {
      pageSize: 1,
      fetch: ['post.uid'],
    }
  );

  const slugsArray = postsResponse.results.map(post => ({
    params: { slug: post.uid },
  }));

  return {
    paths: slugsArray,
    fallback: true
  };
};

 export const getStaticProps: GetStaticProps = async ({params}) => {

  const prismic = getPrismicClient();
  const post = await prismic.getByUID('post', String(params.slug), {});

  return {
    props:{
      post
    }
  }
 

 };
