import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  Chip,
  CircularProgress,
  Grid,
  Rating,
  Link,
} from '@mui/material';
import { ArrowBack, ShoppingCart, Bookmark, Share } from '@mui/icons-material';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../context/AuthContext';
import { googleBooksApi } from '../services/googleBooks';
import { toast } from 'react-toastify';



interface BookDetails {
  id: string;
  volumeInfo: {
    title: string;
    subtitle?: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    description?: string;
    pageCount?: number;
    categories?: string[];
    averageRating?: number;
    ratingsCount?: number;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
      medium?: string;
      large?: string;
    };
    language?: string;
    previewLink?: string;
    infoLink?: string;
  };
  saleInfo?: {
    listPrice?: {
      amount: number;
      currencyCode: string;
    };
    retailPrice?: {
      amount: number;
      currencyCode: string;
    };
    buyLink?: string;
    saleability?: string;
  };
}

const BookDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<BookDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    const fetchBookDetails = async () => {
      if (!id) {
        setError('No book ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await googleBooksApi.get(`/volumes/${id}`, {
          params: { country: 'US' },
          timeout: 10000 // 10 second timeout
        });
        
        if (!response.data) {
          throw new Error('No book data received from the server');
        }
        
        setBook(response.data);
      } catch (err: any) {
        console.error('Error fetching book details:', err);
        setError(
          err.response?.data?.error?.message || 
          err.message || 
          'Failed to load book details. Please try again later.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [id]);

  const handleAddToCart = async () => {
    if (!book) return;
    
    if (!isAuthenticated) {
      toast.info('Please log in to add items to your cart');
      navigate('/login', { state: { from: `/books/${id}` } });
      return;
    }
  
    try {
      setIsAddingToCart(true);
      // Use retailPrice if available, otherwise use listPrice, default to 0 if neither exists
      const price = book.saleInfo?.retailPrice?.amount || 
                   book.saleInfo?.listPrice?.amount || 
                   0;
      
      if (book.saleInfo?.saleability !== 'FOR_SALE' || price === 0) {
        toast.error('This book is not available for purchase');
        setIsAddingToCart(false);
        return;
      }
      
      await addToCart({
        bookId: book.id,
        title: book.volumeInfo.title,
        price: price,
        image: book.volumeInfo.imageLinks?.thumbnail || ''
      });
      
      toast.success('Added to cart!');
    } catch (err: any) {
      console.error('Error adding to cart:', err);
      toast.error(err.message || 'Failed to add to cart. Please try again.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error" variant="h6" gutterBottom>
          {error}
        </Typography>
        <Button variant="contained" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Box>
    );
  }

  if (!book) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Book not found
        </Typography>
        <Button variant="contained" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Box>
    );
  }

  const { volumeInfo, saleInfo } = book;
  const coverImage = volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.medium || 
                    volumeInfo.imageLinks?.large || '/book-placeholder.png';
  const publishedYear = volumeInfo.publishedDate ? new Date(volumeInfo.publishedDate).getFullYear() : null;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <Button 
        startIcon={<ArrowBack />} 
        onClick={() => navigate(-1)}
        sx={{ mb: 3 }}
      >
        Back to Books
      </Button>

      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, mb: 4 }}>
        <Grid container spacing={4}>
          {/* Book Cover */}
          <Grid item xs={12} md={4}>
            <Box
              component="img"
              src={coverImage}
              alt={volumeInfo.title}
              sx={{
                width: '100%',
                maxWidth: 350,
                height: 'auto',
                display: 'block',
                mx: 'auto',
                boxShadow: 3,
                borderRadius: 1,
              }}
            />
            
<Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
  
  <Button 
    variant="outlined"
    startIcon={<Bookmark />}
    sx={{ flex: 1, minWidth: '200px' }}
  >
    Save
  </Button>
</Box>

            {volumeInfo.previewLink && (
              <Button
                fullWidth
                variant="outlined"
                href={volumeInfo.previewLink}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ mt: 2 }}
              >
                Preview Book
              </Button>
            )}
          </Grid>

          {/* Book Details */}
          <Grid item xs={12} md={8}>
            <Typography variant="h3" component="h1" gutterBottom>
              {volumeInfo.title}
            </Typography>
            
            {volumeInfo.subtitle && (
              <Typography variant="h5" color="text.secondary" gutterBottom>
                {volumeInfo.subtitle}
              </Typography>
            )}

            {volumeInfo.authors && (
              <Typography variant="h6" color="text.secondary" gutterBottom>
                By {volumeInfo.authors.join(', ')}
              </Typography>
            )}

            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              {volumeInfo.averageRating && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Rating value={volumeInfo.averageRating} precision={0.5} readOnly />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {volumeInfo.averageRating.toFixed(1)} ({volumeInfo.ratingsCount || 0} ratings)
                  </Typography>
                </Box>
              )}
              
              {volumeInfo.pageCount && (
                <Typography variant="body2" color="text.secondary">
                  {volumeInfo.pageCount} pages
                </Typography>
              )}
              
              {publishedYear && (
                <Typography variant="body2" color="text.secondary">
                  Published: {publishedYear}
                </Typography>
              )}
              
              {volumeInfo.language && (
                <Typography variant="body2" color="text.secondary">
                  Language: {volumeInfo.language.toUpperCase()}
                </Typography>
              )}
            </Box>

            {volumeInfo.categories && (
              <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {volumeInfo.categories.map((category) => (
                  <Chip 
                    key={category} 
                    label={category} 
                    size="small" 
                    variant="outlined"
                  />
                ))}
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>Description</Typography>
              <Box 
                component="div"
                sx={{
                  '& p': {
                    marginBottom: 2,
                    lineHeight: 1.6,
                    '&:last-child': {
                      marginBottom: 0,
                    },
                  },
                  '& br': {
                    display: 'block',
                    content: '" "',
                    marginBottom: '1rem',
                  },
                  '& em': {
                    fontStyle: 'italic',
                  },
                  '& strong': {
                    fontWeight: 'bold',
                  },
                  '& ul, & ol': {
                    paddingLeft: '1.5rem',
                    margin: '1rem 0',
                  },
                  '& li': {
                    marginBottom: '0.5rem',
                  },
                }}
                dangerouslySetInnerHTML={{ 
                  __html: volumeInfo.description || 'No description available.' 
                }} 
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {volumeInfo.publisher && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Publisher</Typography>
                  <Typography>{volumeInfo.publisher}</Typography>
                </Box>
              )}
              
              {volumeInfo.publishedDate && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Published Date</Typography>
                  <Typography>{new Date(volumeInfo.publishedDate).toLocaleDateString()}</Typography>
                </Box>
              )}
              
              {volumeInfo.language && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Language</Typography>
                  <Typography>{volumeInfo.language.toUpperCase()}</Typography>
                </Box>
              )}
              
              {volumeInfo.pageCount && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Pages</Typography>
                  <Typography>{volumeInfo.pageCount}</Typography>
                </Box>
              )}
              
              {volumeInfo.categories && (
                <Box sx={{ width: '100%' }}>
                  <Typography variant="subtitle2" color="text.secondary">Categories</Typography>
                  <Typography>{volumeInfo.categories.join(', ')}</Typography>
                </Box>
              )}
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<ShoppingCart />}
                onClick={handleAddToCart}
                disabled={isAddingToCart || saleInfo?.saleability !== 'FOR_SALE'}
                sx={{ minWidth: 200 }}
              >
                {isAddingToCart ? 'Added to Cart!' : 'Add to Cart'}
              </Button>
              
              
              <Button
                variant="outlined"
                startIcon={<Bookmark />}
              >
                Save for later
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<Share />}
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: volumeInfo.title,
                      text: `Check out "${volumeInfo.title}" on BookHaven`,
                      url: window.location.href,
                    }).catch(console.error);
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link copied to clipboard!');
                  }
                }}
              >
                Share
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default BookDetails;
