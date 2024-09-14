import React, { useEffect, useState } from 'react';
import { ShoppingCart, ChevronLeft } from 'lucide-react'; // Import the ChevronLeft icon
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const MyCart = () => {
  const [Total, setTotal] = useState(0);
  // const [sortedCartItems, setSortedCartItems] = useState([]);
  const navigate = useNavigate();
  const [CartData, setCartData] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const userData = {
    name: 'Harshitha',
    email: 'harshi@gmail.com',
    phoneNumber: '6281936556',
    address: 'knjgtrcgbuhunkndyegcv jgyftdrdgvh bgfrdeseseses',
  };


  useEffect(() => {
    const fetchCart = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:7000/customer/getCorporateCarts',{
          
            headers: { token: `${localStorage.getItem('accessToken')}` }
        
        });
        console.log('Fetched cart data:', response);
        // Check the response structure
        setCartData(response.data || []);
         // Fallback to empty array if carts is undefined
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCart();
  }, []);
  
  
  // useEffect(() => {
  //   const totalAmount = sortedCartItems.reduce(
  //     (sum, cart) => sum + cart.price * cart.quantity,
  //     0
  //   );
  //   setTotal(totalAmount);
  // }, [sortedCartItems]);
  useEffect(() => {
    const totalAmount = CartData.reduce(
      (sum, cart) => sum + cart.category_price * cart.quantity,
      0
    );
    setTotal(totalAmount);
  }, [CartData]);

  // const handleIncrement = (index) => {
  //   setSortedCartItems((prevItems) =>
  //     prevItems.map((item, i) =>
  //       i === index ? { ...item, quantity: item.quantity + 1 } : item
  //     )
  //   );
  // };

  // const handleDecrement = (index) => {
  //   setSortedCartItems((prevItems) =>
  //     prevItems.map((item, i) =>
  //       i === index ? { ...item, quantity: Math.max(item.quantity - 1, 0) } : item
  //     )
  //   );
  // };

  // const handleRemove = (index) => {
  //   setSortedCartItems((prevItems) => prevItems.filter((_, i) => i !== index));
  // };

  const handleIncrement = (index) => {
    setCartData((prevItems) =>
      prevItems.map((item, i) =>
        i === index ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const handleDecrement = (index) => {
    setCartData((prevItems) =>
      prevItems.map((item, i) =>
        i === index ? { ...item, quantity: Math.max(item.quantity - 1, 0) } : item
      )
    );
  };

  const handleRemove = (index) => {
    setCartData((prevItems) => prevItems.filter((_, i) => i !== index));
  };
  const handleViewHome = () => {
    navigate('/home');
  };
  if (isLoading) {
    return <div className="text-center mt-8">Loading...</div>;
  }

 

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex justify-between items-center p-4 bg-white shadow-md">
        {/* Left Arrow */}
        <div className="flex items-center">
          <Link to="/home">
            <ChevronLeft size={24} className="cursor-pointer" onClick={handleViewHome} />
          </Link>
          <h1 className="text-lg text-black font-bold ml-2">My Cart</h1>
        </div>
        <div className="bg-yellow-500 rounded-full h-9 w-9 flex items-center justify-center">
          <ShoppingCart size={24} />
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 flex flex-col items-center mt-4">
        {/* Your Details */}
        <div className="bg-gray-100 shadow-lg rounded-lg p-6 mb-6 w-full max-w-2xl">
          <h2 className="text-xl font-semibold mb-4 text-center">Your Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium-semibold">Name:</p>
              <p className="text-sm">{userData.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium-semibold">Email:</p>
              <p className="text-sm">{userData.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium-semibold">Phone Number:</p>
              <p className="text-sm">{userData.phoneNumber}</p>
            </div>
            <div>
              <p className="text-sm font-medium-semibold">Address:</p>
              <p className="text-sm break-words">{userData.address}</p>
            </div>
          </div>
          <button className="mt-4 text-blue-500 bg-gray-200 px-4 py-2 rounded-md w-24 self-end">
            Change
          </button>
        </div>

        {/* Cart Items Table */}
        <table className="table-auto w-full max-w-md sm:max-w-4xl border-separate border-spacing-2 border border-gray-200 mb-6 bg-white shadow-md rounded-lg">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-sm font-medium">Item</th>
              <th className="border border-gray-300 px-4 py-2 text-sm font-medium">Processing Date</th>
              <th className="border border-gray-300 px-4 py-2 text-sm font-medium">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {CartData?.map((item, index) => (
              <tr
                key={index}
                className={`border border-gray-300 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100`}
              >
                <td className="border border-gray-300 px-4 py-2 text-center">
                  <div className="flex justify-center sm:justify-start items-center gap-4">
                    <img
                      src={item.category_media}
                      className="rounded-full h-10 w-10 mb-2"
                      alt={item.type}
                    />
                    <span className="text-sm font-medium">{item.category_name}</span>
                  </div>
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center text-sm">{item.processing_date}</td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  <div className="flex justify-center sm:justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <button
                        className="text-red-500 text-lg hover:bg-red-100 p-1 rounded-full"
                        onClick={() => handleDecrement(index)}
                      >
                        -
                      </button>
                      <span className="text-sm font-medium">{item.quantity}</span>
                      <button
                        className="text-red-500 text-lg hover:bg-red-100 p-1 rounded-full"
                        onClick={() => handleIncrement(index)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="text-red-500 text-xs hover:bg-red-100 p-1 rounded-full"
                      onClick={() => handleRemove(index)}
                    >
                      ✖
                    </button>
                  </div>
                </td>
              </tr>
            )) || <tr><td colSpan="3" className="text-center">No items found</td></tr> }
          </tbody>
        </table>
      </div>

      <footer className="bg-gray-300 text-black p-4 flex justify-between items-center shadow-md mt-auto">
        <h2 className="text-lg font-bold">Total: {Total}/-</h2>
        <button className="bg-purple-600 text-white p-2 px-4 rounded-lg shadow-md hover:bg-purple-700 transition">
          Pay Now
        </button>
      </footer>
    </div>
  );
};

export default MyCart;
//   const carts = [
//     {
//       id: 1,
//       type: 'lunch',
//       image: 'https://i.ytimg.com/vi/-alTSQo2JTQ/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLDcf_CKym3k-GpbYtKPlEBzmOoOjw',
//       days: 2,
//       dates: ['Fri Sep 13 2024', 'Fri Sep 20 2024', 'Fri Sep 27 2024'],
//       price: 99,
//       quantity: 2,
//     },
//     {
//       id: 2,
//       type: 'lunch',
//       image: 'https://i.ytimg.com/vi/-alTSQo2JTQ/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLDcf_CKym3k-GpbYtKPlEBzmOoOjw',
//       days: 2,
//       dates: ['Fri Sep 13 2024', 'Fri Sep 20 2024', 'Fri Sep 27 2024'],
//       price: 99,
//       quantity: 2,
//     },
//   ];

  // useEffect(() => {
  //   const sortedItems = carts
  //     .flatMap((cart) => cart.dates.map((date) => ({ ...cart, date })))
  //     .sort((a, b) => new Date(a.date) - new Date(b.date));
  //   setSortedCartItems(sortedItems);
  // }, []);
