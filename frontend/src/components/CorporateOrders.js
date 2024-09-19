// import { CakeIcon, CalendarIcon, CheckCircleIcon, HomeIcon, MinusCircleIcon } from '@heroicons/react/solid';
// import axios from 'axios';
// import React, { useEffect, useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';

// const CorporateOrders = () => {
//   const [showCorporate, setShowCorporate] = useState(true);
//   const [expandedOrder, setExpandedOrder] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [orderData, setOrderData] = useState(null);
//   const [error, setError] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchOrders = async () => {
//       setIsLoading(true);
//       setError(null);
//       try {
//         const token = localStorage.getItem('accessToken');
//         const response = await axios.get('http://localhost:7000/customer/corporate/myorders', {
//           headers: { token: `${token}` },
//         });
//         console.log("order response", response.data.data);
//         if (response.data && response.data.data) {
//           const ordersWithCategoryNames = await Promise.all(
//             response.data.data.map(async (order) => {
//               const updatedOrderDetails = await Promise.all(
//                 order.order_details.map(async (detail) => {
//                   const categoryName = await fetchCategoryName(detail.category_id);
//                   return { ...detail, category_name: categoryName };
//                 })
//               );
//               return { ...order, order_details: updatedOrderDetails };
//             })
//           );
//           setOrderData(ordersWithCategoryNames);
//         } else {
//           setError('No data received from the server.');
//           setOrderData(null);
//         }
//       } catch (error) {
//         console.error('Error fetching corporate order data:', error);
//         setError('Failed to fetch orders. Please try again later.');
//         setOrderData(null);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchOrders();
//   }, []);

//   const fetchCategoryName = async (categoryId) => {
//     try {
//       const response = await axios.post(
//         'http://localhost:7000/customer/getcategorynameById',
//         { categoryId }
//       );
//       console.log("backend response",response.data.categoryname.category_name)
//       return response.data.categoryname.category_name;
//     } catch (error) {
//       console.error('Error fetching category name:', error);
//       return 'Unknown Category';
//     }
//   };

//   const toggleOrderDetails = (orderId) => {
//     setExpandedOrder(expandedOrder === orderId ? null : orderId);
//   };

//   const handleViewHome = () => {
//     navigate('/home');
//   };

//   const renderProgressIcons = (progress) => {
//     const stages = ['processing', 'shipped', 'delivered'];
//     const activeIndex = stages.indexOf(progress);
    
//     return (
//       <div className="flex justify-between items-center">
//         {stages.map((stage, index) => (
//           <div key={stage} className="flex flex-col items-center">
//             {index <= activeIndex ? (
//               <CheckCircleIcon className="text-green-500 h-4 w-4 sm:h-6 sm:w-6 mb-1 transition-transform transform hover:scale-110" />
//             ) : (
//               <MinusCircleIcon className="text-gray-400 h-4 w-4 sm:h-6 sm:w-6 mb-1 transition-transform transform hover:scale-110" />
//             )}
//             <span className={`text-xs ${index <= activeIndex ? 'text-gray-900 font-semibold' : 'text-gray-400'}`}>
//               {stage.charAt(0).toUpperCase() + stage.slice(1)}
//             </span>
//           </div>
//         ))}
//       </div>
//     );
//   };

//   const renderOrder = (order) => (
//     <div key={order.corporateorder_generated_id} className="w-full bg-white rounded-lg border shadow-md hover:shadow-xl transition-shadow duration-300 mx-3 sm:mx-4 mb-4">
//       <div
//         className="flex justify-between items-center p-4 sm:p-6 bg-blue-100 cursor-pointer hover:bg-blue-200 transition-colors rounded-t-lg"
//         onClick={() => toggleOrderDetails(order.corporateorder_generated_id)}
//       >
//         <div className="w-full">
//           <p className="text-lg sm:text-xl font-bold text-blue-700">Order ID: {order.corporateorder_generated_id}</p>
//           <p className="text-xs sm:text-sm text-gray-600 mt-1">Date: {order.ordered_at || 'N/A'}</p>
//         </div>
//         <div>
//           <span className="text-gray-500 text-xl sm:text-2xl">
//             {expandedOrder === order.corporateorder_generated_id ? '[-]' : '[+]'}
//           </span>
//         </div>
//       </div>

//       {expandedOrder === order.corporateorder_generated_id && (
//         <div className="p-4 sm:p-6 overflow-x-auto">
//           <table className="w-full bg-white min-w-max">
//             <thead className="bg-gray-100 text-left text-xs sm:text-sm">
//               <tr>
//                 <th className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">Category Name</th>
//                 <th className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">Progress</th>
//                 <th className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">Date</th>
//                 <th className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">Qty</th>
//                 <th className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">Active Qty</th>
//                 <th className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               {order.order_details.map((detail, i) => (
//                 <tr key={i} className="border-t text-xs sm:text-sm hover:bg-gray-50">
//                   <td className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">
//                     {typeof detail.category_name === 'string' ? detail.category_name : 'Unknown Category'}
//                   </td>
//                   <td className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">{renderProgressIcons(detail.delivery_status)}</td>
//                   <td className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">{detail.processing_date}</td>
//                   <td className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">{detail.quantity}</td>
//                   <td className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">{detail.active_quantity}</td>
//                   <td
//                     className={`p-2 sm:p-3 lg:p-4 font-bold whitespace-nowrap ${
//                       detail.status === 'cancelled' ? 'text-red-500' : 'text-green-500'
//                     }`}
//                   >
//                     {detail.status}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );

//   return (
//     <>
//       <header className="w-full bg-green-500 h-16 flex items-center pl-4">
//         <Link to='/home'>
//           <HomeIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white mr-2" onClick={handleViewHome}/> 
//         </Link>
//         <h1 className="text-2xl sm:text-3xl lg:text-4xl text-white">
//           Your Orders
//         </h1>
//       </header>

//       <div className="w-full my-4 sm:my-10 px-4 sm:px-6 lg:px-8 xl:px-0 bg-gradient-to-r from-blue-50 to-white shadow-xl rounded-lg">
//         <div className="flex justify-center gap-4 sm:gap-6 mb-6 sm:mb-10">
//           <button
//             className={`py-2 px-4 sm:py-3 sm:px-8 rounded-full font-semibold text-sm sm:text-lg transition-all duration-300 transform ${
//               showCorporate ? 'bg-yellow-500 text-white shadow-lg hover:scale-105' : 'bg-gray-300 text-gray-700 hover:scale-105'
//             }`}
//             onClick={() => setShowCorporate(true)}
//           >
//             <CakeIcon className="h-5 w-5 inline-block mr-2" />
//             Corporate
//           </button>
//           <button
//             className={`py-2 px-4 sm:py-3 sm:px-8 rounded-full font-semibold text-sm sm:text-lg transition-all duration-300 transform ${
//               !showCorporate ? 'bg-green-500 text-white shadow-lg hover:scale-105' : 'bg-gray-300 text-gray-700 hover:scale-105'
//             }`}
//             onClick={() => setShowCorporate(false)}
//           >
//             <CalendarIcon className="h-5 w-5 inline-block mr-2" />
//             Events
//           </button>
//         </div>

//         {showCorporate && (
//           <div className="space-y-4 sm:space-y-8 w-full">
//             {isLoading ? (
//               <p>Loading orders...</p>
//             ) : error ? (
//               <p className="text-red-500">{error}</p>
//             ) : orderData ? (
//               orderData.map(renderOrder)
//             ) : (
//               <p>No corporate orders found.</p>
//             )}
//           </div>
//         )}

//         {!showCorporate && (
//           <div className="text-center py-8">
//             <p className="text-lg text-gray-700">Events content will be displayed here.</p>
//           </div>
//         )}
//       </div>
//     </>
//   );
// };

// export default CorporateOrders;
// /*
// react-dom.development.js:13123 Uncaught Error: Objects are not valid as a React child (found: object with keys {category_name}). If you meant to render a collection of children, use an array instead. at throwOnInvalidObjectType (react-dom.development.js:13123:1) at reconcileChildFibers (react-dom.development.js:14064:1) at reconcileChildren (react-dom.development.js:19186:1) at updateHostComponent (react-dom.development.js:19953:1) at beginWork (react-dom.development.js:21657:1) at beginWork$1 (react-dom.development.js:27465:1) at performUnitOfWork (react-dom.development.js:26596:1) at workLoopSync (react-dom.development.js:26505:1) at renderRootSync (react-dom.development.js:26473:1) at recoverFromConcurrentError (react-dom.development.js:25889:1)
// for your above given code, i am getting this error when i open the collapsable card
// */

import React, { useEffect, useState, useCallback } from 'react';
import { CakeIcon, CalendarIcon, CheckCircleIcon, HomeIcon, MinusCircleIcon } from '@heroicons/react/solid';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const CorporateOrders = () => {
  const [showCorporate, setShowCorporate] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log('hiiiiii')
        const token = localStorage.getItem('accessToken');
        const response = await axios.get('http://localhost:7000/customer/corporate/myorders', {
          headers: { token: `${token}` },
        });
        if (response.data && response.data.data) {
          const ordersWithCategoryNames = await Promise.all(
            response.data.data.map(async (order) => {
              const updatedOrderDetails = await Promise.all(
                order.order_details.map(async (detail) => {
                  const categoryName = await fetchCategoryName(detail.category_id);
                  return { ...detail, category_name: categoryName };
                })
              );
              return { ...order, order_details: updatedOrderDetails };
            })
          );
          setOrderData(ordersWithCategoryNames);
        } else {
          setError('No data received from the server.');
          setOrderData(null);
        }
      } catch (error) {
        console.error('Error fetching corporate order data:', error);
        setError('Failed to fetch orders. Please try again later.');
        setOrderData(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const fetchCategoryName = async (categoryId) => {
    try {
      const response = await axios.post(
        'http://localhost:7000/customer/getcategorynameById',
        { categoryId }
      );
      return response.data.categoryname.category_name;
    } catch (error) {
      console.error('Error fetching category name:', error);
      return 'Unknown Category';
    }
  };

  const toggleOrderDetails = useCallback((orderId) => {
    setExpandedOrders(prev => {
      const newExpandedOrders = prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId];
      console.log('Toggled order:', orderId, 'New expanded orders:', newExpandedOrders);
      return newExpandedOrders;
    });
  }, []);

  const handleViewHome = () => {
    navigate('/home');
  };

  const renderProgressIcons = (progress) => {
    const stages = ['processing', 'shipped', 'delivered'];
    const activeIndex = stages.indexOf(progress);
    
    return (
      <div className="flex justify-between items-center">
        {stages.map((stage, index) => (
          <div key={stage} className="flex flex-col items-center">
            {index <= activeIndex ? (
              <CheckCircleIcon className="text-green-500 h-4 w-4 sm:h-6 sm:w-6 mb-1 transition-transform transform hover:scale-110" />
            ) : (
              <MinusCircleIcon className="text-gray-400 h-4 w-4 sm:h-6 sm:w-6 mb-1 transition-transform transform hover:scale-110" />
            )}
            <span className={`text-xs ${index <= activeIndex ? 'text-gray-900 font-semibold' : 'text-gray-400'}`}>
              {stage.charAt(0).toUpperCase() + stage.slice(1)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const renderOrder = useCallback((order) => {
    const isExpanded = expandedOrders.includes(order.corporateorder_generated_id);
    console.log('Rendering order:', order.corporateorder_generated_id, 'Expanded:', isExpanded);
    
    return (
      <div key={order.corporateorder_generated_id} className="w-full bg-white rounded-lg border shadow-md hover:shadow-xl transition-shadow duration-300 mx-3 sm:mx-4 mb-4">
        <div
          className="flex justify-between items-center p-4 sm:p-6 bg-blue-100 cursor-pointer hover:bg-blue-200 transition-colors rounded-t-lg"
          onClick={() => toggleOrderDetails(order.corporateorder_generated_id)}
        >
          <div className="w-full">
            <p className="text-lg sm:text-xl font-bold text-blue-700">Order ID: {order.corporateorder_generated_id}</p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Date: {order.ordered_at || 'N/A'}</p>
          </div>
          <div>
            <span className="text-gray-500 text-xl sm:text-2xl">
              {isExpanded ? '[-]' : '[+]'}
            </span>
          </div>
        </div>

        {isExpanded && (
          <div className="p-4 sm:p-6 overflow-x-auto">
            <table className="w-full bg-white min-w-max">
              <thead className="bg-gray-100 text-left text-xs sm:text-sm">
                <tr>
                  <th className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">Category Name</th>
                  <th className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">Progress</th>
                  <th className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">Date</th>
                  <th className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">Qty</th>
                  <th className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">Active Qty</th>
                  <th className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody>
                {order.order_details.map((detail, i) => (
                  <tr key={i} className="border-t text-xs sm:text-sm hover:bg-gray-50">
                    <td className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">
                      {detail.category_name || 'Unknown Category'}
                    </td>
                    <td className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">{renderProgressIcons(detail.delivery_status)}</td>
                    <td className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">{detail.processing_date}</td>
                    <td className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">{detail.quantity}</td>
                    <td className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">{detail.active_quantity}</td>
                    <td
                      className={`p-2 sm:p-3 lg:p-4 font-bold whitespace-nowrap ${
                        detail.status === 'cancelled' ? 'text-red-500' : 'text-green-500'
                      }`}
                    >
                      {detail.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }, [expandedOrders, toggleOrderDetails]);

  return (
    <>
      <header className="w-full bg-green-500 h-16 flex items-center pl-4">
        <Link to='/home'>
          <HomeIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white mr-2" onClick={handleViewHome}/> 
        </Link>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl text-white">
          Your Orders
        </h1>
      </header>

      <div className="w-full my-4 sm:my-10 px-4 sm:px-6 lg:px-8 xl:px-0 bg-gradient-to-r from-blue-50 to-white shadow-xl rounded-lg">
        <div className="flex justify-center gap-4 sm:gap-6 mb-6 sm:mb-10">
          <button
            className={`py-2 px-4 sm:py-3 sm:px-8 rounded-full font-semibold text-sm sm:text-lg transition-all duration-300 transform ${
              showCorporate ? 'bg-yellow-500 text-white shadow-lg hover:scale-105' : 'bg-gray-300 text-gray-700 hover:scale-105'
            }`}
            onClick={() => setShowCorporate(true)}
          >
            <CakeIcon className="h-5 w-5 inline-block mr-2" />
            Corporate
          </button>
          <button
            className={`py-2 px-4 sm:py-3 sm:px-8 rounded-full font-semibold text-sm sm:text-lg transition-all duration-300 transform ${
              !showCorporate ? 'bg-green-500 text-white shadow-lg hover:scale-105' : 'bg-gray-300 text-gray-700 hover:scale-105'
            }`}
            onClick={() => setShowCorporate(false)}
          >
            <CalendarIcon className="h-5 w-5 inline-block mr-2" />
            Events
          </button>
        </div>

        {showCorporate && (
          <div className="space-y-4 sm:space-y-8 w-full">
            {isLoading ? (
              <p>Loading orders...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : orderData ? (
              orderData.map(renderOrder)
            ) : (
              <p>No corporate orders found.</p>
            )}
          </div>
        )}

        {!showCorporate && (
          <div className="text-center py-8">
            <p className="text-lg text-gray-700">Events content will be displayed here.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default CorporateOrders;