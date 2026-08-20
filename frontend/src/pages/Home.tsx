import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CardActionArea,
  Box,
  Button,
  useTheme,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import backgroundImage from '../assets/pexels-alana-sousa-1723789-3409497.jpg';
import { api } from '../services/api'; 
import { searchBooks } from '../services/googleBooks';
import axios from 'axios'; // Replace the axios import with this



interface Book {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    imageLinks?: {
      thumbnail?: string;
    };
    publishedDate?: string;
  };
  saleInfo?: {
    listPrice?: {
      amount: number;
      currencyCode: string;
    };
  };
}

const Home = () => {
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();

  const fetchFeaturedBooks = async (query: string) => {
    try {
      return await searchBooks(query, 4);
    } catch (error) {
      console.error('Error fetching featured books:', error);
      return [];
    }
  };
  useEffect(() => {
    const loadBooks = async () => {
      try {
        const books = await fetchFeaturedBooks('best sellers');
        setFeaturedBooks(books);
      } catch (error) {
        console.error('Error loading books:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBooks();
  }, []);

  const handleBookClick = (bookId: string) => {
    navigate(`/books/${bookId}`);
  };

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)',
        width: '100%',
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          zIndex: 1,
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, py: 8 }}>
        <Box 
          sx={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            p: 4,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            maxWidth: '800px',
            mx: 'auto',
            mb: 6,
            textAlign: 'center'
          }}
        >
          <Typography 
            variant="h2" 
            component="h1" 
            sx={{ 
              mb: 3, 
              fontWeight: 700,
              color: 'primary.main',
              textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
            }}
          >
            Welcome to BookHaven
          </Typography>
          <Typography 
            variant="h5" 
            component="p" 
            sx={{ 
              color: 'text.secondary',
              fontWeight: 400,
              lineHeight: 1.6
            }}
          >
            Discover your next great read from our curated collection of books
          </Typography>
        </Box>

        <Typography 
          variant="h4" 
          component="h2" 
          gutterBottom 
          align="center" 
          sx={{ 
            mb: 6, 
            color: 'white',
            textShadow: '1px 1px 3px rgba(0,0,0,0.5)'
          }}
        >
          Featured Books
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          {loading ? (
            <Grid item xs={12} sx={{ textAlign: 'center' }}>
              <CircularProgress sx={{ color: 'white' }} />
            </Grid>
          ) : featuredBooks.length === 0 ? (
            <Grid item xs={12}>
              <Typography align="center" color="white">No featured books found.</Typography>
            </Grid>
          ) : (
            featuredBooks.map((book) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={book.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardActionArea 
                    onClick={() => handleBookClick(book.id)}
                    sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={
                        book.volumeInfo.imageLinks?.thumbnail || 
                        '/book-placeholder.png'
                      }
                      alt={book.volumeInfo.title}
                      sx={{ 
                        objectFit: 'contain',
                        width: '100%',
                        backgroundColor: '#f5f5f5',
                        p: 2
                      }}
                    />
                    <CardContent sx={{ width: '100%' }}>
                      <Typography gutterBottom variant="h6" component="div" noWrap>
                        {book.volumeInfo.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {book.volumeInfo.authors?.join(', ') || 'Unknown Author'}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))
          )}
        </Grid>

        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Button 
            variant="contained" 
            size="large" 
            onClick={() => navigate('/books')}
            sx={{ 
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Browse All Books
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;
