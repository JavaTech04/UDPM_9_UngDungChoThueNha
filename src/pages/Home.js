import axios from "axios";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Carousel, Alert, Spinner, Modal, Form } from "react-bootstrap";
import { apiKey } from "../utils/constants";
import "./home.css";
import { Box, Button, Option, Select, Typography } from "@mui/joy";

const usePagination = (items, initialPerPage = 10) => {
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: initialPerPage,
    totalPages: 0,
    totalResults: 0,
  });

  const paginatedItems = useMemo(() => {
    const startIndex = (pagination.currentPage - 1) * pagination.perPage;
    const endIndex = startIndex + pagination.perPage;

    return {
      currentItems: items.slice(startIndex, endIndex),
      totalPages: Math.ceil(items.length / pagination.perPage),
      totalResults: items.length,
    };
  }, [items, pagination.currentPage, pagination.perPage]);

  const changePage = useCallback((newPage) => {
    setPagination((prev) => ({
      ...prev,
      currentPage: newPage,
    }));
  }, []);

  const changePerPage = useCallback((newPerPage) => {
    setPagination((prev) => ({
      ...prev,
      perPage: newPerPage,
      currentPage: 1,
    }));
  }, []);

  return {
    ...pagination,
    currentItems: paginatedItems.currentItems,
    totalPages: paginatedItems.totalPages,
    totalResults: paginatedItems.totalResults,
    changePage,
    changePerPage,
  };
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  // Hàm tạo danh sách các trang để hiển thị
  const getPageNumbers = () => {
    const maxPagesToShow = 5; // Số trang tối đa hiển thị

    // Nếu tổng số trang nhỏ hơn maxPagesToShow, hiển thị hết
    if (totalPages <= maxPagesToShow) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Logic để hiển thị các trang một cách thông minh
    const leftSide = Math.floor((maxPagesToShow - 3) / 2);

    // Nếu trang hiện tại ở đầu
    if (currentPage <= maxPagesToShow - 2) {
      return [
        ...Array.from({ length: maxPagesToShow - 1 }, (_, i) => i + 1),
        "...",
        totalPages,
      ];
    }

    // Nếu trang hiện tại ở cuối
    if (currentPage > totalPages - (maxPagesToShow - 2)) {
      return [
        1,
        "...",
        ...Array.from(
          { length: maxPagesToShow - 1 },
          (_, i) => totalPages - (maxPagesToShow - 2) + i
        ),
      ];
    }

    // Các trường hợp ở giữa
    return [
      1,
      "...",
      ...Array.from(
        { length: maxPagesToShow - 2 },
        (_, i) => currentPage - leftSide + i
      ),
      "...",
      totalPages,
    ];
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav>
      <ul className="pagination mb-0 justify-content-center">
        {/* Nút Previous */}
        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            &#10094; Trước
          </Button>
        </li>

        {/* Các nút số trang */}
        {pageNumbers.map((page, index) => {
          if (page === "...") {
            return (
              <li key={`ellipsis-${index}`} className="page-item">
                <span className="page-link text-muted">...</span>
              </li>
            );
          }

          return (
            <li
              key={page}
              className={`page-item ${currentPage === page ? "active" : ""}`}
            >
              <Button
                variant={currentPage === page ? "primary" : "outline-secondary"}
                size="sm"
                onClick={() => onPageChange(page)}
                className="mx-1"
              >
                {page}
              </Button>
            </li>
          );
        })}

        {/* Nút Next */}
        <li
          className={`page-item ${
            currentPage === totalPages ? "disabled" : ""
          }`}
        >
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Tiếp &#10095;
          </Button>
        </li>
      </ul>
    </nav>
  );
};

const MarketplaceHome = ({ referenceId }) => {
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [buyLoading, setBuyLoading] = useState(false);
  const [buyError, setBuyError] = useState(null);

  const [lastFetchTime, setLastFetchTime] = useState(Date.now());

  // Memoized filter function
  const filteredItems = useMemo(() => {
    return allItems.filter(
      (itemData) =>
        itemData.type === "UniqueAsset" &&
        itemData.item.price !== null &&
        itemData.item.owner.referenceId !== referenceId
    );
  }, [allItems, referenceId]);

  // Optimized fetch function with cancellation
  const fetchAllItems = useCallback(
    async (signal) => {
      setLoading(true);
      setError(null);

      try {
        const fetchPage = async (page) => {
          const response = await axios.get(
            "https://api.gameshift.dev/nx/items",
            {
              signal,
              params: {
                perPage: 100,
                page: page,
                // collectionId: "791f789f-dd74-41bd-b74e-f1ddf71727fd",
                collectionId: "2829c24d-1df2-4b8d-b927-eb15a1ac2b63",
              },
              headers: {
                accept: "application/json",
                "x-api-key": apiKey,
              },
            }
          );
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

        // So sánh dữ liệu mới với dữ liệu cũ
        const hasChanged =
          JSON.stringify(allFetchedItems) !== JSON.stringify(allItems);

        if (hasChanged) {
          setAllItems(allFetchedItems);
          setLastFetchTime(Date.now());
        }
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
    },
    [allItems]
  );

  // Thêm nút làm mới thủ công
  const handleManualRefresh = () => {
    fetchAllItems();
  };

  // Interval để tự động fetch dữ liệu (mỗi 30 giây)
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchAllItems();
    }, 30000); // 30 giây

    // Cleanup interval khi component bị hủy
    return () => clearInterval(intervalId);
  }, [fetchAllItems]);

  // Fetch data with cleanup
  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        await fetchAllItems(controller.signal);
      } catch (err) {
        if (axios.isCancel(err)) {
          return;
        }
        console.error("Fetch error:", err);
      }
    };

    fetchData();

    return () => {
      controller.abort();
    };
  }, [fetchAllItems]);
  // Pagination hook
  const {
    currentItems,
    currentPage,
    totalPages,
    totalResults,
    perPage,
    changePage,
    changePerPage,
  } = usePagination(filteredItems);

  // Buy item handler
  const handleBuyItem = async (itemData) => {
    // Thay vì để trực tiếp itemData, hãy trích xuất item
    setSelectedItem(itemData.item);
    setBuyError(null);
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
        <h2 className="text-muted">Không có dữ liệu!</h2>
        <Button variant="primary" onClick={() => fetchAllItems()}>
          Tải lại
        </Button>
      </div>
    );
  }

  return (
    <>
      <header className="bg-primary text-white p-3 text-center">
        <h1>
          <div className="scrolling-text">
            Chào mừng đến với cửa hàng của chúng tôi! Khám phá các sản phẩm
            tuyệt vời ngay hôm nay.
          </div>
        </h1>
      </header>
      <section>
        <Carousel interval={2000}>
          <Carousel.Item>
            <img
              className="d-block w-100"
              src="https://www.nhatot.com/_next/image?url=https%3A%2F%2Fcdn.chotot.com%2Fadmincentre%2FF1Iy8pIV295wRSonsdRDkQyFRY2Thcip3egSSilkyBg%2Fpreset%3Araw%2Fplain%2F9b8dc9ce0f6367d20b2b06856688d446-2820459848732268726.jpg&w=1920&q=75"
              alt="First slide"
            />
          </Carousel.Item>
          <Carousel.Item>
            <img
              className="d-block w-100"
              src="https://www.nhatot.com/_next/image?url=https%3A%2F%2Fcdn.chotot.com%2Fadmincentre%2FyBhtF0umYzoin8P-zvuOPNhhuN7CKpYIK9HFGLu6K0w%2Fpreset%3Araw%2Fplain%2Ff828d23ca5817fc621868c24ac02ec41-2906689577158153760.jpg&w=1920&q=75"
              alt="Second slide"
            />
          </Carousel.Item>
          <Carousel.Item>
            <img
              className="d-block w-100"
              src="https://www.nhatot.com/_next/image?url=https%3A%2F%2Fcdn.chotot.com%2Fadmincentre%2F5brlsfjgobqb6GHL_ARdJ9hKlwZBeUPMFTDCDJ8HVlM%2Fpreset%3Araw%2Fplain%2F641d00cf91962826635b6a63d18d673a-2887378227930944686.jpg&w=1920&q=75"
              alt="Third slide"
            />
          </Carousel.Item>
        </Carousel>
      </section>
      <section
        className="property-listing"
        style={{
          background: "linear-gradient(to right, #0288D1, white, #FF5722)",
          padding: "50px",
        }}
      >
        <h2 className="m-3">Mua bán nhà đất theo địa điểm</h2>
        <div className="row">
          <div className="col-md-4">
            <div className="card">
              <div className="card-img-top" style={{ position: "relative" }}>
                <img
                  src="https://bannha.net/wp-content/uploads/elementor/thumbs/hn7-q47ou0cu5z7x80rl9givgifa97bzo3wgbardc246vk.jpg"
                  className="img-fluid"
                  alt="Property"
                  style={{ width: "450px", height: "200px" }}
                />
                <div
                  className="card-location"
                  style={{
                    position: "absolute",
                    bottom: "10px",
                    left: "10px",
                    background: "rgba(0, 0, 0, 0.5)",
                    color: "white",
                    padding: "5px",
                  }}
                >
                  Hanoi
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-img-top" style={{ position: "relative" }}>
                <img
                  src="https://bannha.net/wp-content/uploads/elementor/thumbs/thanh-pho-moi-binh-duong-o-dau-q47oudiktnpxqk8h4m7nff3qklj4nvcp13w61xkogg.jpg"
                  className="img-fluid"
                  alt="Property"
                  style={{ width: "450px", height: "200px" }}
                />
                <div
                  className="card-location"
                  style={{
                    position: "absolute",
                    bottom: "10px",
                    left: "10px",
                    background: "rgba(0, 0, 0, 0.5)",
                    color: "white",
                    padding: "5px",
                  }}
                >
                  Binh Duong
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4" style={{ marginTop: "55px" }}>
            <div className="card">
              <div className="card-img-top" style={{ position: "relative" }}>
                <img
                  src="https://bannha.net/wp-content/uploads/2024/03/TPHCM.jpg"
                  className="img-fluid"
                  alt="Property"
                />
                <div
                  className="card-location"
                  style={{
                    position: "absolute",
                    bottom: "10px",
                    left: "10px",
                    background: "rgba(0, 0, 0, 0.5)",
                    color: "white",
                    padding: "5px",
                  }}
                >
                  Ho Chi Minh
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card">
              <div className="card-img-top" style={{ position: "relative" }}>
                <img
                  src="https://bannha.net/wp-content/uploads/elementor/thumbs/du-lich-da-nang-q47ou52145ecu2kri0k0az8l84otqlf3zy0sqfx80g.jpg"
                  className="img-fluid"
                  alt="Property"
                  style={{ width: "450px", height: "200px" }}
                />
                <div
                  className="card-location"
                  style={{
                    position: "absolute",
                    bottom: "10px",
                    left: "10px",
                    background: "rgba(0, 0, 0, 0.5)",
                    color: "white",
                    padding: "5px",
                  }}
                >
                  Da Nang
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-img-top" style={{ position: "relative" }}>
                <img
                  src="https://bannha.net/wp-content/uploads/elementor/thumbs/dan-so-vung-tau-3-q47oui7rrtwdcm1nd68s9vx1jivyqcvcpr5lgbdplc.jpg"
                  alt="Property"
                  style={{ width: "450px", height: "200px" }}
                />
                <div
                  className="card-location"
                  style={{
                    position: "absolute",
                    bottom: "10px",
                    left: "10px",
                    background: "rgba(0, 0, 0, 0.5)",
                    color: "white",
                    padding: "5px",
                  }}
                >
                  Vung Tau
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container-fluid">
        {/* Pagination and display controls */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 3,
          }}
        >
          <div style={{ fontSize: "24px", fontWeight: "500" }}>
            Sản phẩm đang bán
          </div>
          <div className="text-end" style={{ flexDirection: "column" }}>
            <Button size="sm" onClick={handleManualRefresh}>
              Làm mới ngay
            </Button>
            <Typography className="text-muted">
              Cập nhật lần cuối: {new Date(lastFetchTime).toLocaleString()}
            </Typography>
          </div>
        </Box>
        {/* Product grid */}
        <div className="row row-cols-1 row-cols-md-4 g-4 mt-2">
          {currentItems.map((itemData) => {
            const item = itemData.item;
            return (
              <div key={item.id} className="col">
                <div className="custom-card shadow-lg">
                  <div className="custom-card-img">
                    <img
                      src={item.imageUrl || "/default-image.jpg"}
                      alt={item.name || "Hình ảnh sản phẩm"}
                      className="w-100 h-100"
                    />
                  </div>
                  <div className="custom-card-body">
                    <h5 className="fw-bold">{item.name}</h5>
                    <p className="text-muted small">
                      Tác giả:{" "}
                      {item.owner.referenceId.length > 20
                        ? `${item.owner.referenceId.substring(0, 20)}...`
                        : item.owner.referenceId}
                    </p>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="price-tag">
                        {item?.price?.naturalAmount &&
                        !isNaN(Number(item?.price?.naturalAmount))
                          ? `$${Number(item?.price?.naturalAmount).toFixed(
                              2
                            )} USDC`
                          : "N/A"}
                      </span>
                      <button
                        className="btn-custom"
                        onClick={() => handleBuyItem(itemData)}
                      >
                        Mua ngay
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="row g-3 align-items-center mt-3">
          <Box className="col-12 col-md-4 d-flex align-items-center justify-content-between justify-content-md-start">
            <Typography className="me-3 text-nowrap">
              Hiển thị: {currentItems.length} / {totalResults} sản phẩm
            </Typography>
            <Select
              size="sm"
              style={{ width: "auto" }}
              value={perPage}
              onChange={(e) => changePerPage(Number(e.target.value))}
              className="d-md-none d-block"
            >
              {[5, 10, 20, 50].map((num) => (
                <Option key={num} value={num}>
                  {num} sản phẩm/trang
                </Option>
              ))}
            </Select>
          </Box>

          <div className="col-12 col-md-4 d-flex justify-content-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={changePage}
            />
          </div>

          <div className="col-12 col-md-4 d-none d-md-block text-end">
            <Form.Select
              size="sm"
              style={{ width: "auto", float: "right" }}
              value={perPage}
              onChange={(e) => changePerPage(Number(e.target.value))}
            >
              {[5, 10, 20, 50].map((num) => (
                <option key={num} value={num}>
                  {num} sản phẩm/trang
                </option>
              ))}
            </Form.Select>
          </div>
        </div>
      </div>
      {/* Purchase Confirmation Modal */}
      {selectedItem && (
        <Modal
          show={!!selectedItem}
          onHide={() => setSelectedItem(null)}
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>Xác nhận mua {selectedItem.name}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="row">
              <div className="col-md-6">
                <img
                  src={selectedItem.imageUrl}
                  alt={selectedItem.name}
                  className="img-fluid mb-3 rounded"
                  style={{
                    maxHeight: "300px",
                    width: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
              <div className="col-md-6">
                <h5 className="mb-3">Chi tiết sản phẩm</h5>
                <div className="card mb-3">
                  <div className="card-body">
                    <p className="card-text">
                      <strong>Tên:</strong> {selectedItem.name}
                    </p>
                    <p className="card-text" style={{ fontSize: "12px" }}>
                      <strong>Mô tả:</strong>{" "}
                      {selectedItem.description || "Không có mô tả"}
                    </p>
                    <p className="card-text">
                      <strong>Giá:</strong> $
                      {(selectedItem.priceCents / 100).toFixed(2)} USDC
                    </p>
                  </div>
                </div>

                {selectedItem.attributes &&
                  selectedItem.attributes.length > 0 && (
                    <div className="card">
                      <div className="card-header">Thuộc tính</div>
                      <ul className="list-group list-group-flush">
                        {selectedItem.attributes.map((attr, index) => (
                          <li
                            key={index}
                            className="list-group-item d-flex justify-content-between align-items-center"
                          >
                            <span className="text-muted">{attr.traitType}</span>
                            <span className="badge bg-primary rounded-pill">
                              {attr.value}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {buyError && (
                  <Alert variant="danger" className="mt-3">
                    {buyError}
                  </Alert>
                )}
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setSelectedItem(null)}
              disabled={buyLoading}
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={buyItemWithPhantomWallet}
              disabled={buyLoading}
            >
              {buyLoading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Đang xử lý...
                </>
              ) : (
                "Xác nhận mua"
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};

export default MarketplaceHome;
