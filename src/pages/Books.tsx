import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  IconButton,
  InputBase,
  Card,
  CardMedia,
  CardContent,
  CardActionArea,
  Pagination,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  type SelectChangeEvent,
  Button,
  FormControlLabel,
  Checkbox,
  Chip,
} from '@mui/material';
import { Search as SearchIcon, AddShoppingCart as AddShoppingCartIcon } from '@mui/icons-material';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import { googleBooksApi } from '../services/googleBooks';

// Replace with your Google Books API key
const GOOGLE_BOOKS_API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;

interface Book {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    categories?: string[];
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    publishedDate?: string;
    publisher?: string;
    pageCount?: number;
    averageRating?: number;
  };
  saleInfo?: {
    saleability?: string;
    listPrice?: {
      amount: number;
      currencyCode: string;
    };
    retailPrice?: {
      amount: number;
      currencyCode: string;
    };
    buyLink?: string;
  };
}

const Books = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [filter, setFilter] = useState('');
  const [showOnlyForSale, setShowOnlyForSale] = useState(false);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  // Process URL query parameters when component mounts or URL changes
  useEffect(() => {
    const query = searchParams.get('q') || '';
    const orderBy = searchParams.get('orderBy') || 'relevance';
    const categoryParam = searchParams.get('category') || 'all';
    const filterParam = searchParams.get('filter') || '';
    
    setSearchTerm(query);
    setSortBy(orderBy);
    setCategory(categoryParam);
    setFilter(filterParam);
    setPage(0);
    setBooks([]);
    setHasMore(true);
    
    // If we have a category from the URL but no search term, set a default search term
    if (categoryParam !== 'all' && !query) {
      setSearchTerm(categoryParam);
    }
  }, [location.search]);

  // Fetch books based on current filters and search term
  useEffect(() => {
    // In Books.tsx, update the fetchBooks function inside the useEffect hook
const fetchBooks = async () => {
  // Only fetch if we have a search term, filter, or category
  if (!searchTerm && !filter && category === 'all' && !showOnlyForSale) {
    setLoading(false);
    return;
  }
  
  setLoading(true);
  setError('');
  
  try {
    let query = '';
    
    // Build the query based on search term and category
    if (searchTerm && category !== 'all') {
      // Search within the selected category
      query = `intitle:${searchTerm} subject:${category}`;
    } else if (searchTerm) {
      // Just search by book title if no category selected
      query = `intitle:${searchTerm}`;
    } else if (category !== 'all') {
      // Just show books in the selected category if no search term
      query = `subject:${category}`;
    } else {
      // Default to popular books if no search or category
      query = 'popular books';
    }

    const params: any = {
      q: query,
      startIndex: page * 10,
      maxResults: 10,
      orderBy: sortBy === 'newest' ? 'newest' : 'relevance',
      printType: 'books',
      langRestrict: 'en'
    };

    // Apply the "Available for Sale" filter
    if (showOnlyForSale) {
      params.filter = 'paid-ebooks';
    } else if (filter) {
      params.filter = filter;
    }
    
    const response = await googleBooksApi.get('/volumes', {
      params,
      timeout: 10000
    });
    
    // Replace lines 154-156
if (!response.data?.items || response.data.items.length === 0) {
  // No books found - set empty array and stop
  setBooks(page === 0 ? [] : books);
  setHasMore(false);
  setLoading(false);
  return;
}
    
    const newBooks = response.data.items.map((item: any) => ({
      id: item.id,
      volumeInfo: {
        title: item.volumeInfo?.title || 'Untitled',
        authors: item.volumeInfo?.authors || ['Unknown Author'],
        description: item.volumeInfo?.description || 'No description',
        imageLinks: item.volumeInfo?.imageLinks || {
          thumbnail: 'https://via.placeholder.com/128x196.png?text=No+Cover',
          smallThumbnail: 'https://via.placeholder.com/128x196.png?text=No+Cover'
        },
        categories: item.volumeInfo?.categories || [],
        publishedDate: item.volumeInfo?.publishedDate || '',
        pageCount: item.volumeInfo?.pageCount,
        averageRating: item.volumeInfo?.averageRating,
      },
      saleInfo: item.saleInfo || {},
    }));
    
    setBooks(prevBooks => {
      if (page === 0) {
        return newBooks;
      }
      // Filter out duplicates by checking if book ID already exists
      const existingIds = new Set(prevBooks.map(book => book.id));
      const uniqueNewBooks = newBooks.filter((book: Book) => !existingIds.has(book.id));
      return [...prevBooks, ...uniqueNewBooks];
    });
    setHasMore(newBooks.length === 10);
  } catch (err: any) {
    console.error('Error fetching books:', err);
    setError(err.message || 'Failed to fetch books');
    setBooks([]);
  } finally {
    setLoading(false);
  }
};
    const timer = setTimeout(() => {
      fetchBooks();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm, page, sortBy, category, filter, showOnlyForSale]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(searchTerm);
    setPage(0); // Reset to first page on new search
  };

  const handleBookClick = (bookId: string) => {
    navigate(`/books/${bookId}`);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setPage(page - 1);
  };

  const handleAddToCart = (book: Book) => {
    const saleInfo = book.saleInfo || {};
    const price = saleInfo.retailPrice?.amount || 0;
    const currencyCode = saleInfo.retailPrice?.currencyCode || 'USD';
    
    console.log('Adding to cart - Book ID:', book.id);
    console.log('Saleability:', saleInfo.saleability);
    console.log('Retail price:', saleInfo.retailPrice);
    console.log('Final price:', price, currencyCode);
    
    // Check if the book is available for sale
    if (saleInfo.saleability !== 'FOR_SALE' || !saleInfo.retailPrice) {
      console.log('This book is not available for purchase');
      return;
    }

    addToCart({
      bookId: book.id,  // Use bookId instead of id to match the CartItem interface
      title: book.volumeInfo.title,
      price: price,
      image: book.volumeInfo.imageLinks?.thumbnail,
    });

    // Reset the loading state after a short delay
    setTimeout(() => {
      setAddingToCart(null);
    }, 1000);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Book Search
        </Typography>

        <Paper
          component="form"
          onSubmit={handleSearch}
          sx={{
            p: '2px 4px',
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            mb: 2,
          }}
        >
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Search books..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <IconButton type="submit" sx={{ p: '10px' }} aria-label="search">
            <SearchIcon />
          </IconButton>
        </Paper>

        <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography>Category:</Typography>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="category-select-label">Category</InputLabel>
            <Select
              labelId="category-select-label"
              id="category-select"
              value={category}
              label="Category"
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(0);
              }}
              size="small"
            >
              <MenuItem value="all">
                <em>All Categories</em>
              </MenuItem>
              <MenuItem value="fiction">Fiction</MenuItem>
              <MenuItem value="nonfiction">Nonfiction</MenuItem>
              <MenuItem value="science">Science</MenuItem>
              <MenuItem value="history">History</MenuItem>
              <MenuItem value="biography">Biography</MenuItem>
              <MenuItem value="technology">Technology</MenuItem>
              <MenuItem value="science fiction">Science Fiction</MenuItem>
              <MenuItem value="fantasy">Fantasy</MenuItem>
              <MenuItem value="mystery">Mystery</MenuItem>
              <MenuItem value="romance">Romance</MenuItem>
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Checkbox
                checked={showOnlyForSale}
                onChange={(e) => {
                  setShowOnlyForSale(e.target.checked);
                  setPage(0);
                }}
                color="primary"
              />
            }
            label="Available for Sale Only"
          />
        </Box>
      </Box>

      <Grid container spacing={4}>
        {loading ? (
          <Grid item xs={12} sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress />
          </Grid>
        ) : books.length === 0 ? (
          <Grid item xs={12}>
            <Typography>No books found. Try a different search term or category.</Typography>
          </Grid>
        ) : (
          books.map((book) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={book.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardActionArea 
                  component="div"
                  onClick={() => navigate(`/books/${book.id}`)}
                  sx={{ flexGrow: 1 }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={book.volumeInfo.imageLinks?.thumbnail || '/book-placeholder.png'}
                    alt={book.volumeInfo.title}
                    sx={{ objectFit: 'contain', p: 1, backgroundColor: 'background.paper' }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
  <Typography gutterBottom variant="h6" component="h3" noWrap>
    {book.volumeInfo.title}
  </Typography>
  <Typography variant="body2" color="text.secondary" gutterBottom>
    {book.volumeInfo.authors?.join(', ') || 'Unknown Author'}
  </Typography>
  {book.volumeInfo.publishedDate && (
    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
      {new Date(book.volumeInfo.publishedDate).getFullYear()}
    </Typography>
  )}
  
  {/* Availability Badge */}
  <Box sx={{ mt: 1, mb: 1 }}>
    {book.saleInfo?.saleability === 'FOR_SALE' && book.saleInfo?.retailPrice ? (
      <Chip 
        label="Available for Sale" 
        color="success" 
        size="small" 
        sx={{ fontSize: '0.7rem' }}
      />
    ) : (
      <Chip 
        label="Not for Sale" 
        color="default" 
        size="small" 
        sx={{ fontSize: '0.7rem' }}
      />
    )}
  </Box>
  
  {/* Price Display - Show retail price (what gets added to cart) */}
  {book.saleInfo?.retailPrice ? (
    <Typography variant="h6" color="primary" sx={{ mt: 1, fontWeight: 'bold' }}>
      {new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: book.saleInfo.retailPrice.currencyCode,
      }).format(book.saleInfo.retailPrice.amount)}
    </Typography>
  ) : book.saleInfo?.listPrice ? (
    <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
      {new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: book.saleInfo.listPrice.currencyCode,
      }).format(book.saleInfo.listPrice.amount)}
    </Typography>
  ) : (
    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
      Price not available
    </Typography>
  )}
</CardContent>
                
                </CardActionArea>
                <Box sx={{ p: 1, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={addingToCart === book.id ? null : <AddShoppingCartIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(book);
                    }}
                    disabled={!!addingToCart || book.saleInfo?.saleability !== 'FOR_SALE'}
                    sx={{
                      '&.Mui-disabled': {
                        backgroundColor: addingToCart === book.id ? 'success.main' : 'grey.400',
                        color: addingToCart === book.id ? 'success.contrastText' : 'grey.600',
                      },
                    }}
                  >
                    {addingToCart === book.id ? 'Added!' : 
                     book.saleInfo?.saleability !== 'FOR_SALE' ? 'Not Available' : 'Add to Cart'}
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {hasMore && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => setPage(page + 1)}
          >
            Load More
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default Books;