// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import axios from 'axios';
// import { Alert, Button, Card, Form, Modal, Spinner } from 'react-bootstrap';
// import { apiKey } from '../api';

// const usePagination = (items, initialPerPage = 10) => {
//   const [pagination, setPagination] = useState({
//     currentPage: 1,
//     perPage: initialPerPage,
//     totalPages: 0,
//     totalResults: 0
//   });

//   const paginatedItems = useMemo(() => {
//     const startIndex = (pagination.currentPage - 1) * pagination.perPage;
//     const endIndex = startIndex + pagination.perPage;

//     return {
//       currentItems: items.slice(startIndex, endIndex),
//       totalPages: Math.ceil(items.length / pagination.perPage),
//       totalResults: items.length
//     };
//   }, [items, pagination.currentPage, pagination.perPage]);

//   const changePage = useCallback((newPage) => {
//     setPagination(prev => ({
//       ...prev,
//       currentPage: newPage
//     }));
//   }, []);

//   const changePerPage = useCallback((newPerPage) => {
//     setPagination(prev => ({
//       ...prev,
//       perPage: newPerPage,
//       currentPage: 1
//     }));
//   }, []);

//   return {
//     ...pagination,
//     currentItems: paginatedItems.currentItems,
//     totalPages: paginatedItems.totalPages,
//     totalResults: paginatedItems.totalResults,
//     changePage,
//     changePerPage
//   };
// };

// const Pagination = ({ currentPage, totalPages, onPageChange }) => {
//   if (totalPages <= 1) return null;

//   return (
//     <nav>
//       <ul className="pagination mb-0">
//         {['Đầu', 'Trước', 'Tiếp', 'Cuối'].map((label, index) => {
//           const isStart = index === 0;
//           const isBack = index === 1;
//           const isNext = index === 2;
//           const isEnd = index === 3;

//           const isDisabled =
//             ((isStart || isBack) && currentPage === 1) ||
//             ((isNext || isEnd) && currentPage === totalPages);

//           const pageToGo =
//             isStart ? 1 :
//               isBack ? currentPage - 1 :
//                 isNext ? currentPage + 1 :
//                   totalPages;

//           return (
//             <li
//               key={label}
//               className={`page-item ${isDisabled ? 'disabled' : ''}`}
//             >
//               <Button
//                 variant="outline-secondary"
//                 size="sm"
//                 className={index > 0 ? 'ms-2' : ''}
//                 onClick={() => onPageChange(pageToGo)}
//                 disabled={isDisabled}
//               >
//                 {label}
//               </Button>
//             </li>
//           );
//         })}
//         <li className="page-item mx-2">
//           <span className="page-link">
//             Trang {currentPage} / {totalPages}
//           </span>
//         </li>
//       </ul>
//     </nav>
//   );
// };

// const MarketplaceHome = ({ referenceId }) => {
//   const [allItems, setAllItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedItem, setSelectedItem] = useState(null);
//   const [buyLoading, setBuyLoading] = useState(false);
//   const [buyError, setBuyError] = useState(null);

//   // Memoized filter function
//   const filteredItems = useMemo(() => {
//     return allItems.filter(itemData =>
//       itemData.type === 'UniqueAsset' &&
//       itemData.item.priceCents !== null &&
//       itemData.item.owner.referenceId !== referenceId
//     );
//   }, [allItems, referenceId]);

//   // Optimized fetch function with cancellation
//   const fetchAllItems = useCallback(async (signal) => {
//     setLoading(true);
//     setError(null);

//     try {
//       const fetchPage = async (page) => {
//         const response = await axios.get('https://api.gameshift.dev/nx/items', {
//           signal,
//           params: {
//             perPage: 100,
//             page: page,
//             collectionId: '791f789f-dd74-41bd-b74e-f1ddf71727fd',
//           },
//           headers: {
//             accept: 'application/json',
//             'x-api-key': apiKey,
//           },
//         });
//         return response.data;
//       };

//       let allFetchedItems = [];
//       let page = 1;
//       let totalPages = 1;

//       while (page <= totalPages) {
//         const { data, meta } = await fetchPage(page);
//         allFetchedItems.push(...data);
//         totalPages = meta.totalPages;
//         page++;
//       }

//       setAllItems(allFetchedItems);
//     } catch (err) {
//       if (axios.isCancel(err)) {
//         console.log('Request canceled', err.message);
//       } else {
//         setError('Không thể tải danh sách sản phẩm: ' + err.message);
//         console.error('Fetch error:', err);
//       }
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // Fetch data with cleanup
//   useEffect(() => {
//     const controller = new AbortController();
//     fetchAllItems(controller.signal);

//     return () => {
//       controller.abort();
//     };
//   }, [fetchAllItems]);

//   // Pagination hook
//   const {
//     currentItems,
//     currentPage,
//     totalPages,
//     totalResults,
//     perPage,
//     changePage,
//     changePerPage
//   } = usePagination(filteredItems);

//   // Buy item handler
//   const handleBuyItem = async (item) => {
//     setSelectedItem(item);
//     setBuyError(null);
//   };

//   // Buy with Phantom Wallet
//   const buyItemWithPhantomWallet = async () => {
//     setBuyLoading(true);
//     setBuyError(null);

//     try {
//       const provider = window.phantom?.solana;
//       if (!provider || !provider.isConnected) {
//         throw new Error("Vui lòng kết nối ví Phantom trước khi mua");
//       }

//       const response = await axios.post(
//         `https://api.gameshift.dev/nx/unique-assets/${selectedItem.id}/buy`,
//         {
//           buyerId: referenceId
//         },
//         {
//           headers: {
//             'accept': 'application/json',
//             'content-type': 'application/json',
//             'x-api-key': apiKey
//           }
//         }
//       );

//       // Bỏ qua transactionId, chỉ sử dụng consentUrl
//       const { consentUrl } = response.data;
//       window.open(consentUrl, '_blank');
//       fetchAllItems();
//     } catch (err) {
//       console.error('Lỗi mua sản phẩm:', err);

//       const errorMessage = err.response?.data?.message ||
//         err.message ||
//         'Không thể thực hiện giao dịch. Vui lòng thử lại.';

//       setBuyError(errorMessage);
//     } finally {
//       setBuyLoading(false);
//     }
//   };

//   // Render loading state
//   if (loading) {
//     return (
//       <div className="d-flex justify-content-center align-items-center vh-100">
//         <Spinner animation="border" variant="primary" />
//       </div>
//     );
//   }

//   // Render error state
//   if (error) {
//     return (
//       <Alert variant="danger" className="text-center">
//         {error}
//         <Button
//           variant="outline-primary"
//           className="ms-3"
//           onClick={() => fetchAllItems()}
//         >
//           Thử lại
//         </Button>
//       </Alert>
//     );
//   }

//   // Render empty state
//   if (filteredItems.length === 0) {
//     return (
//       <div className="container text-center py-5">
//         <h2 className="text-muted">Hiện tại chưa có sản phẩm nào để mua</h2>
//         <Button
//           variant="primary"
//           onClick={() => fetchAllItems()}
//         >
//           Tải lại
//         </Button>
//       </div>
//     );
//   }

//   return (
//     <div className="container-fluid py-5">
//       <div className="container">
//         <h1 className="text-center mb-5 display-4 fw-bold text-primary">
//           Trang chủ
//         </h1>

//         {/* Pagination and display controls */}
//         <div className="d-flex justify-content-between align-items-center mb-3">
//           <div className="d-flex align-items-center">
//             <span className="me-3">
//               Hiển thị: {currentItems.length} / {totalResults} sản phẩm
//             </span>
//             <Form.Select
//               size="sm"
//               style={{ width: 'auto' }}
//               value={perPage}
//               onChange={(e) => changePerPage(Number(e.target.value))}
//             >
//               {[5, 10, 20, 50].map((num) => (
//                 <option key={num} value={num}>
//                   {num} sản phẩm/trang
//                 </option>
//               ))}
//             </Form.Select>
//           </div>

//           <Pagination
//             currentPage={currentPage}
//             totalPages={totalPages}
//             onPageChange={changePage}
//           />
//         </div>

//         {/* Product grid */}
//         <div className="row row-cols-1 row-cols-md-3 g-4">
//           {currentItems.map((itemData) => {
//             const item = itemData.item;
//             return (
//               <div key={item.id} className="col">
//                 <Card className="h-100 d-flex flex-column shadow-sm hover-lift">
//                   <Card.Img
//                     variant="top"
//                     src={item.imageUrl || '/default-image.jpg'}
//                     alt={item.name || 'Hình ảnh sản phẩm'}
//                     className="card-img-top"
//                     style={{
//                       width: '100%',
//                       height: 'auto',
//                       aspectRatio: '16/9',
//                       objectFit: 'cover',
//                     }}
//                   />
//                   <Card.Body style={{ flex: 1 }}>
//                     <Card.Title className="fw-bold">{item.name}</Card.Title>
//                     <Card.Text className="text-muted">
//                       Tác giả: {item.owner.referenceId}
//                     </Card.Text>

//                     <div className="d-flex justify-content-between align-items-center mt-auto">
//                       <div>
//                         <span className="badge bg-primary">
//                           {`$${(item.priceCents / 100).toFixed(2)} USDC`}
//                         </span>
//                       </div>
//                       <Button
//                         variant="outline-primary"
//                         onClick={() => handleBuyItem(itemData.item)}
//                       >
//                         Mua ngay
//                       </Button>
//                     </div>
//                   </Card.Body>
//                 </Card>
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       {/* Purchase Confirmation Modal */}
//       {/* Purchase Confirmation Modal */}
//       {selectedItem && (
//         <Modal show={!!selectedItem} onHide={() => setSelectedItem(null)} size="lg">
//           <Modal.Header closeButton>
//             <Modal.Title>Xác nhận mua {selectedItem.name}</Modal.Title>
//           </Modal.Header>
//           <Modal.Body>
//             <div className="row">
//               <div className="col-md-6">
//                 <img
//                   src={selectedItem.imageUrl}
//                   alt={selectedItem.name}
//                   className="img-fluid mb-3 rounded"
//                   style={{ maxHeight: '300px', width: '100%', objectFit: 'cover' }}
//                 />
//               </div>
//               <div className="col-md-6">
//                 <h5 className="mb-3">Chi tiết sản phẩm</h5>
//                 <div className="card mb-3">
//                   <div className="card-body">
//                     <p className="card-text">
//                       <strong>Tên:</strong> {selectedItem.name}
//                     </p>
//                     <p className="card-text">
//                       <strong>Mô tả:</strong> {selectedItem.description || 'Không có mô tả'}
//                     </p>
//                     <p className="card-text">
//                       <strong>Giá:</strong> ${(selectedItem.priceCents / 100).toFixed(2)} USDC
//                     </p>
//                   </div>
//                 </div>

//                 {selectedItem.attributes && selectedItem.attributes.length > 0 && (
//                   <div className="card">
//                     <div className="card-header">Thuộc tính</div>
//                     <ul className="list-group list-group-flush">
//                       {selectedItem.attributes.map((attr, index) => (
//                         <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
//                           <span className="text-muted">{attr.traitType}</span>
//                           <span className="badge bg-primary rounded-pill">{attr.value}</span>
//                         </li>
//                       ))}
//                     </ul>
//                   </div>
//                 )}

//                 {buyError && (
//                   <Alert variant="danger" className="mt-3">
//                     {buyError}
//                   </Alert>
//                 )}
//               </div>
//             </div>
//           </Modal.Body>
//           <Modal.Footer>
//             <Button variant="secondary" onClick={() => setSelectedItem(null)} disabled={buyLoading}>
//               Hủy
//             </Button>
//             <Button
//               variant="primary"
//               onClick={buyItemWithPhantomWallet}
//               disabled={buyLoading}
//             >
//               {buyLoading ? (
//                 <>
//                   <Spinner
//                     as="span"
//                     animation="border"
//                     size="sm"
//                     role="status"
//                     aria-hidden="true"
//                     className="me-2"
//                   />
//                   Đang xử lý...
//                 </>
//               ) : (
//                 'Xác nhận mua'
//               )}
//             </Button>
//           </Modal.Footer>
//         </Modal>
//       )}
//     </div>
//   );
// };

// export default MarketplaceHome;

import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { Alert, Button, Spinner, Modal } from "react-bootstrap";
import { apiKey } from "../api";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper-bundle.min.css";
import { FaExclamationTriangle } from "react-icons/fa";

const MarketplaceHome = ({ referenceId }) => {
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [buyLoading, setBuyLoading] = useState(false);
  const [buyError, setBuyError] = useState(null);
  const [showModal, setShowModal] = useState(false); // State to show/hide modal

  // Memoized filter function
  const filteredItems = useMemo(() => {
    return allItems.filter(
      (itemData) =>
        itemData.type === "UniqueAsset" &&
        itemData.item.priceCents !== null &&
        itemData.item.owner.referenceId !== referenceId
    );
  }, [allItems, referenceId]);

  // Fetch data with cleanup
  const fetchAllItems = useCallback(async (signal) => {
    setLoading(true);
    setError(null);

    try {
      const fetchPage = async (page) => {
        const response = await axios.get("https://api.gameshift.dev/nx/items", {
          signal,
          params: {
            perPage: 100,
            page: page,
            collectionId: "791f789f-dd74-41bd-b74e-f1ddf71727fd",
          },
          headers: {
            accept: "application/json",
            "x-api-key": apiKey,
          },
        });
        return response.data;
      };

      let allFetchedItems = [];
      let page = 1;
      let totalPages = 1;

      while (page <= totalPages) {
        const { data, meta } = await fetchPage(page);
        allFetchedItems.push(...data);
        totalPages = meta.totalPages;
        page++;
      }

      setAllItems(allFetchedItems);
    } catch (err) {
      if (axios.isCancel(err)) {
        console.log("Request canceled", err.message);
      } else {
        setError("Không thể tải danh sách sản phẩm: " + err.message);
        console.error("Fetch error:", err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchAllItems(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchAllItems]);

  // Buy item handler
  const handleBuyItem = async (item) => {
    setSelectedItem(item);
    setBuyError(null);
    setShowModal(true); // Show modal when user clicks "Buy"
  };

  // Buy with Phantom Wallet
  const buyItemWithPhantomWallet = async () => {
    setBuyLoading(true);
    setBuyError(null);

    try {
      const provider = window.phantom?.solana;
      if (!provider || !provider.isConnected) {
        throw new Error("Vui lòng kết nối ví Phantom trước khi mua");
      }

      const response = await axios.post(
        `https://api.gameshift.dev/nx/unique-assets/${selectedItem.id}/buy`,
        {
          buyerId: referenceId,
        },
        {
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            "x-api-key": apiKey,
          },
        }
      );

      // Bỏ qua transactionId, chỉ sử dụng consentUrl
      const { consentUrl } = response.data;
      window.open(consentUrl, "_blank");
      fetchAllItems();
    } catch (err) {
      console.error("Lỗi mua sản phẩm:", err);

      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Không thể thực hiện giao dịch. Vui lòng thử lại.";

      setBuyError(errorMessage);
    } finally {
      setBuyLoading(false);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <Alert variant="danger" className="text-center">
        {error}
        <Button
          variant="outline-primary"
          className="ms-3"
          onClick={() => fetchAllItems()}
        >
          Thử lại
        </Button>
      </Alert>
    );
  }

  // Render empty state
  if (filteredItems.length === 0) {
    return (
      <div className="container text-center py-5">
        <h2 className="text-muted">Hiện tại chưa có sản phẩm nào để mua</h2>
        <Button variant="primary" onClick={() => fetchAllItems()}>
          Tải lại
        </Button>
      </div>
    );
  }

  return (
    <div className="container-fluid py-5 bg-light">
      <div className="container">
        {/* Slider Quảng Cáo */}
        <Swiper
          spaceBetween={30}
          slidesPerView={1}
          loop={true}
          pagination={{
            clickable: true,
          }}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          className="mb-4 ad-slider"
          style={{ width: "100%", height: "350px" }}
        >
          <SwiperSlide>
            <div
              className="ad-banner"
              style={{ width: "100%", height: "350px" }}
            >
              <img
                src="https://via.placeholder.com/1200x400.png?text=Gi%E1%BA%A3m%20Gi%C3%A1%20M%E1%BB%99t%20S%E1%BB%91%20S%E1%BA%A3n%20Ph%E1%BA%A9m"
                alt="Quảng cáo 1"
                className="d-block w-100"
              />
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="ad-banner">
              <img
                src="https://via.placeholder.com/1200x400.png?text=Gi%E1%BA%A3m%20Gi%C3%A1%20M%E1%BB%99t%20S%E1%BB%91%20S%E1%BA%A3n%20Ph%E1%BA%A9m"
                alt="Quảng cáo 2"
                className="d-block w-100"
              />
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="ad-banner">
              <img
                src="https://via.placeholder.com/1200x400.png?text=Khuy%E1%BB%87n%20M%C3%A1i%20S%E1%BB%8Dt%20Mua%20H%C3%B3a%20T%C3%ACnh"
                alt="Quảng cáo 3"
                className="d-block w-100"
              />
            </div>
          </SwiperSlide>
        </Swiper>
        {/* Sản phẩm */}
        <div className="row">
          {filteredItems.map((itemData) => {
            const item = itemData.item;
            return (
              <div key={item.id} className="col-md-4 mb-4">
                <div className="card h-100 shadow-sm border-0 hoverable-card">
                  <img
                    src={item.imageUrl || "/default-image.jpg"}
                    alt={item.name || "Hình ảnh sản phẩm"}
                    className="card-img-top"
                    style={{
                      width: "100%",
                      height: "auto",
                      aspectRatio: "16/9",
                      objectFit: "cover",
                    }}
                  />
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title fw-bold text-dark">
                      {item.name}
                    </h5>
                    <p className="card-text text-muted mb-3">
                      Tác giả: {item.owner.referenceId}
                    </p>
                    <div className="d-flex justify-content-between align-items-center mt-auto">
                      <span className="badge bg-primary p-2">
                        {`$${(item.priceCents / 100).toFixed(2)}`}
                      </span>
                      <Button
                        variant="primary"
                        onClick={() => handleBuyItem(item)}
                        disabled={buyLoading}
                      >
                        {buyLoading ? (
                          <Spinner animation="border" size="sm" />
                        ) : (
                          "Mua"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận mua sản phẩm</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4>{selectedItem?.name}</h4>
          <p>
            Bạn muốn mua sản phẩm này với giá{" "}
            <strong>{`$${(selectedItem?.priceCents / 100).toFixed(
              2
            )} USDC`}</strong>
            ?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={buyItemWithPhantomWallet}
            disabled={buyLoading}
          >
            {buyLoading ? <Spinner animation="border" size="sm" /> : "Mua"}
          </Button>
        </Modal.Footer>
      </Modal>
      {buyError && (
        <Alert variant="danger" className="fixed-bottom mb-0">
          <FaExclamationTriangle /> {buyError}
        </Alert>
      )}
    </div>
  );
};

export default MarketplaceHome;