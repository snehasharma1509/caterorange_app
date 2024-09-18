import React, { useEffect, useState } from 'react';
import { ShoppingCart, ChevronLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const MyCart = () => {
  const [Total, setTotal] = useState(0);
  const [CartData, setCartData] = useState([]);
  const [sortedData,setSortedData]=useState([])
  const [cartIndividualData, setCartIndividualData] = useState([]);
  const [redirectUrl, setRedirectUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const OrderData=[];
  const [ orderDetails, setOrderDetails]= useState([])

  const [userData, setUserData] = useState({
    Name: '',
    email: '',
    PhoneNumber: '',
    address: '',
    id:''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:7000/customer/getCorporateCarts', {
          headers: { token: `${localStorage.getItem('accessToken')}` },
        });
        console.log('in carts', response.data);
        setCartData(response.data || []);
      } catch (error) {
        console.error('Error fetching cart data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCart();
  }, []);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await axios.get('http://localhost:7000/customer/getCustomerDetails', {
          headers: { token: `${localStorage.getItem('accessToken')}` },
        });
        console.log('user',response.data)
        setUserData(response.data);
      } catch (error) {
        console.error('Error fetching customer data:', error);
      }
    };
    fetchCustomer();
  }, []);

  useEffect(() => {
    const totalAmount = sortedData.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    );
    setTotal(totalAmount);
  }, [sortedData]);
  

 

  useEffect(() => {
    let tempCartData = [];
    CartData.forEach(cart => {
      cart.cart_order_details.forEach(detail => {
        tempCartData.push({
          id: cart.corporatecart_id,
          content: detail
        });
      });
    });
 
    setCartIndividualData(tempCartData);
  }, [CartData]);

  useEffect(() => {
  
    if (cartIndividualData.length > 0) {
      console.log('each data',cartIndividualData)
      // Flatten the data since `content` is an object, not an array
      const flattenedData = cartIndividualData.map(cart => ({
        id: cart.id,
        ...cart.content
      }));
  
      // Sort the items based on the `date` field
      const sortedCartItems = flattenedData.sort((a, b) => new Date(a.date) - new Date(b.date));
      setSortedData(sortedCartItems);
    }
  }, [cartIndividualData]);
  
  console.log('sorted',sortedData)
  console.log('each data',cartIndividualData)


  const handleIncrement = async (index) => {
    setSortedData((prevItems) => {
      const updatedItems = prevItems.map((item, i) =>
        i === index ? { ...item, quantity: parseInt(item.quantity, 10) + 1 } : item
      );
  
      const updatedItem = updatedItems[index];
  
      const updateBackend = async () => {
        try {
          const res = await axios.put(
            `http://localhost:7000/customer/updateCartItem/${updatedItem.id}`,
            {
              date: updatedItem.date,
              quantity: updatedItem.quantity
            }
          );
          console.log('Update successful:', res.data);
        } catch (error) {
          console.error('Error updating cart item quantity:', error);
        }
      };
  
      updateBackend();
  
      return updatedItems;
    });
  };
  
  const handleDecrement = async (index) => {
    setSortedData((prevItems) => {
      const updatedItems = prevItems.map((item, i) =>
        i === index ? { ...item, quantity: Math.max(parseInt(item.quantity, 10) - 1, 0) } : item
      );
  
      const updatedItem = updatedItems[index];
  
      const updateBackend = async () => {
        try {
          const res = await axios.put(
            `http://localhost:7000/customer/updateCartItem/${updatedItem.id}`,
            {
              date: updatedItem.date,
              quantity: updatedItem.quantity,
            }
          );
          console.log('Update successful:', res.data);
        } catch (error) {
          console.error('Error updating cart item quantity:', error);
        }
      };
  
      updateBackend();
  
      return updatedItems;
    });
  };
  const handleRemove = async (index) => {
    // Ensure the index is within bounds and the item exists
    if (index < 0 || index >= sortedData.length) {
      console.error('Index out of bounds:', index);
      return;
    }
  
    // Extract the item to be deleted
    const itemToRemove = sortedData[index];
    
    if (!itemToRemove || !itemToRemove.date) {
      console.error('Item or date is undefined:', itemToRemove);
      return;
    }
  
    console.log('Item to remove:', itemToRemove.date);
  
    // Update the local state to remove the item from the list
    setSortedData((prevItems) => prevItems.filter((_, i) => i !== index));
  
    try {
      // Make the API call to remove the item
      await axios.delete(`http://localhost:7000/customer/removeCartItem/${itemToRemove.id}`, {
        data: { date: itemToRemove.date }  // Send date in the data object
      });
    } catch (error) {
      console.error('Error removing cart item:', error);
    }
  };
  
  
  

  const handleViewHome = () => {
    navigate('/home');
  };

  const handleModalToggle = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleViewPayment = async () => {
    try {
      // First, prepare the order data and send it to create the order
      let OrderData = []; // Initialize the array
      for (let i = 0; i < sortedData.length; i++) {
        const content = sortedData[i];
        const Data = {
          category_id: content.category_id,
          processing_date: content.date,
          delivery_status: 'shipped',
          quantity: content.quantity,
          active_quantity: content.quantity,
          media: null,
          delivery_details: null
        };
        OrderData.push(Data);
      }
      const OrderDataJSON = JSON.stringify(OrderData);
  
      const response = await axios.post('http://localhost:7000/customer/corporate/transfer-cart-to-order', {
        order_details: OrderDataJSON,
        customer_id: userData.id,
        total_amount: Total,
        payment_id: null,
        customer_address: 'abc123',
        payment_status: 'success',
        corporateorder_generated_id: 'HS123'
      });
  
      // Set the order details from the response
      setOrderDetails(response.data.order);
  
      if (response.status === 200) {
        console.log('Cart details added to orders', response.data.order);
  
        // Now call the function to handle the second API request
        await PaymentDetails();
        await sendOrderDetails(response.data.order);
      } else {
        console.error('Failed to add details to order_table:', response.data);
      }
    } catch (error) {
      console.error('Error adding details to order_table:', error);
    }
  };
  
  // Create a separate function to handle the second API call for sending order details
  const sendOrderDetails = async (orderDetails) => {
    try {
      let response;
      let details = orderDetails.order_details;
      console.log('length', details.length);
  
      for (let i = 0; i < details.length; i++) {
        response = await axios.post('http://localhost:7000/customer/corporateOrderDetails', {
          corporateorder_id: orderDetails.corporateorder_id,
          processing_date: details[i].processing_date,
          delivery_status: details[i].delivery_status,
          category_id: details[i].category_id,
          quantity: details[i].quantity,
          active_quantity: details[i].active_quantity,
          media: details[i].media,
          delivery_details: details[i].delivery_details
        });
        console.log('Order details sent in loop');
      }
  
      console.log('Order details sent:', orderDetails);
      if (response) {
        console.log('Order details successfully added:', response.data);
      } else {
        console.error('Failed to add details to order_table:', response.data);
      }
    } catch (error) {
      console.error('Error sending order details:', error);
    }
  };

  const PaymentDetails= async()=>{
    try{

          const token=localStorage.getItem('accessToken')
          const response = await axios.post('http://localhost:7000/pay', 
            {amount: Total},{headers: { access_token: `${localStorage.getItem('accessToken')}` },
          });
          if (response.data && response.data.redirectUrl) {
            setRedirectUrl(response.data.redirectUrl);
            // Redirect to the provided URL
            window.location.href = response.data.redirectUrl;
          } else {
            setError('Unexpected response format.');
          }
        } catch (err) {
          // Check for specific error details
          if (err.response) {
            setError(`Error: ${err.response.data.message || 'An error occurred. Please try again.'}`);
          } else {
            setError('Network error or no response from the server.');
          }
        } finally {
          setLoading(false);
        }
  }
  
//   const handleViewPayment= async() =>{
//     try{
//     for(let i=0 ;i<cartIndividualData.length;i++)
//       {
//         const content =cartIndividualData[i].content;
//        const Data={
//         category_id:content.category_id,
//         processing_date:content.date,
//         delivery_status:'shipped',
//         quantity:content.quantity,
//         active_quantity:content.quantity,
//         media:null,
//         delivery_details:null
//        }
//         OrderData.push(Data)
       
//       }
//       const OrderDataJSON = JSON.stringify(OrderData);
    
//       const response = await axios.post('http://localhost:7000/customer/corporate/transfer-cart-to-order', {
//         order_details: OrderDataJSON ,
//         customer_id:userData.id,
//         total_amount:Total,
//         payment_id:null,
//         customer_address:'abc123',
//         payment_status:'success',
//         corporateorder_generated_id:'HS123'
                
//             }
//         );
//      setOrderDetails(response.data.order);
//     if (response.status === 200) {
//         console.log('Cart details added to orders', response.data.order);
        
//     } else {
//         console.error('Failed to add details to order_table:', response.data);
//     }
// } catch (error) {
//     console.error('Error adding details to order_table:', error);
// }


// try{
//   let response;
// let details=orderDetails.order_details
// console.log('length',details.length)
//   for(let i=0; i<details.length; i++){

//     response = await axios.post('http://localhost:7000/customer/corporateOrderDetails', {
//       corporateorder_id:orderDetails.corporateorder_id,
//       processing_date:details[i].processing_date ,
//       delivery_status: details[i].delivery_status,
//       category_id:details[i].category_id ,
//       quantity:details[i].quantity ,
//       active_quantity:details[i].active_quantity ,
//       media:details[i].media ,
//       delivery_details: details[i].delivery_details
    
//           });
//           console.log('in loop')
//         }
//         console.log('orderd details sending:', orderDetails);
//     if (response.success) {
//             console.log('Cart details added to orders here...', response.data);    
//         } else {
//             console.error('Failed to add details to order_table:', response.data);
//         }
//     } catch (error) {
//         console.error('Error adding details to order_table:', error);
//     }
  


//   // try{
   
//   //   const response= axios.post('http://localhost:7000/customer/corporateOrderDetails',{
//   //     order_id,
//   //     order_details: OrderDataJSON 
//   //   })

//   // }

//   //   try{
 
//   //   const response = await axios.post('http://localhost:7000/corporate/pay', {
//   //     userid: userData.id,
//   //     amount: Total
//   //   });
//   //   if (response.data && response.data.redirectUrl) {
//   //     setRedirectUrl(response.data.redirectUrl);
//   //     // Redirect to the provided URL
//   //     window.location.href = response.data.redirectUrl;
//   //   } else {
//   //     setError('Unexpected response format.');
//   //   }
//   // } catch (err) {
//   //   // Check for specific error details
//   //   if (err.response) {
//   //     setError(`Error: ${err.response.data.message || 'An error occurred. Please try again.'}`);
//   //   } else {
//   //     setError('Network error or no response from the server.');
//   //   }
//   // } finally {
//   //   setLoading(false);
//   // }
// }
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSaveChanges = async () => {
    try {
      await axios.put('http://localhost:7000/customer/updateCustomerDetails', userData, {
        headers: { token: `${localStorage.getItem('accessToken')}` },
      });
      setIsModalOpen(false);
      // Refresh the page to show updated details
      window.location.reload();
    } catch (error) {
      console.error('Error updating customer data:', error);
    }
  };

  if (isLoading) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Fixed Header */}
      <header className="bg-white shadow-md p-4 fixed top-0 left-0 right-0 z-10">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
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
      </header>

      {/* Scrollable Content */}
      <main className="flex-grow overflow-y-auto mt-16 mb-20 p-4">
        <div className="max-w-6xl mx-auto">
          {/* User Details Card */}
          <div className="bg-gray-100 shadow-lg rounded-lg p-4 mb-6">
            <h2 className="text-xl font-bold mb-4">Your Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <p className="text-sm font-bold">Name:</p>
                <p className="text-sm">{userData.Name}</p>
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-bold">Email:</p>
                <p className="text-sm">{userData.email}</p>
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-bold">Phone Number:</p>
                <p className="text-sm">{userData.PhoneNumber}</p>
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-bold">Address:</p>
                <p className="text-sm">{userData.address}</p>
              </div>
            </div>
            <button
              onClick={handleModalToggle}
              className="mt-4 text-blue-500 bg-gray-200 px-4 py-2 rounded-md w-full sm:w-auto"
            >
              Change
            </button>
          </div>

          {/* Cart Items */}
          {sortedData.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <h2 className="text-xl font-bold mb-4">Your cart is empty</h2>
              <p>No items are added to cart. Please add some items to continue.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200 bg-white shadow-md rounded-lg">
                <thead className="bg-gray-200 text-gray-700">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-sm font-medium">Item</th>
                    <th className="border border-gray-300 px-4 py-2 text-sm font-medium">Processing Date</th>
                    <th className="border border-gray-300 px-4 py-2 text-sm font-medium">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedData.map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-100'}>
                      <td className="border px-4 py-2 flex items-center gap-3">
                        <img src={item.image} alt='food' className='rounded-full h-8 w-8 object-cover' />
                        <span className="text-sm">{item.type}</span>
                      </td>
                      <td className="border px-4 py-2 text-sm">{item.date}</td>
                      <td className="border px-4 py-2">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            className="bg-gray-200 px-2 py-1 rounded-l-lg text-sm"
                            onClick={() => handleDecrement(index)}
                          >
                            -
                          </button>
                          <span className="px-4 text-sm">{item.quantity}</span>
                          <button
                            className="bg-gray-200 px-2 py-1 rounded-r-lg text-sm"
                            onClick={() => handleIncrement(index)}
                          >
                            +
                          </button>
                          <button
                            className="ml-2 bg-red-500 text-white px-2 py-1 rounded text-sm"
                            onClick={() => handleRemove(index)}
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

     


      {/* Fixed Footer */}
      <footer className="bg-gray-300 text-black p-4 fixed bottom-0 left-0 right-0 z-10">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <h2 className="text-lg font-bold bg-yellow-400 p-2 rounded-md shadow-md">
            Total: {Total}/-
          </h2>
          <button className="bg-purple-600 text-white p-2 px-4 rounded-lg shadow-md hover:bg-purple-700 transition" onClick={handleViewPayment}>
            Pay Now
          </button>
        </div>
      </footer>

      {/* Modal Dialog for Editing User Details */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md m-4">
            <h2 className="text-xl font-bold mb-4">Edit Your Details</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name:</label>
                <input
                  type="text"
                  name="Name"
                  value={userData.Name}
                  onChange={handleInputChange}
                  className="border rounded w-full px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email:</label>
                <input
                  type="email"
                  name="email"
                  value={userData.email}
                  onChange={handleInputChange}
                  className="border rounded w-full px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number:</label>
                <input
                  type="text"
                  name="PhoneNumber"
                  value={userData.PhoneNumber}
                  onChange={handleInputChange}
                  className="border rounded w-full px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address:</label>
                <input
                  type="text"
                  name="address"
                  value={userData.address}
                  onChange={handleInputChange}
                  className="border rounded w-full px-3 py-2"
                />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={handleSaveChanges}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition"
              >
                Save Changes
              </button>
              <button
                onClick={handleModalToggle}
                className="ml-2 bg-gray-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCart;



