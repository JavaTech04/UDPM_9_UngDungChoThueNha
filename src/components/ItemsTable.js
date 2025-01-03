import React, { useState, useEffect, useCallback } from "react";
import { apiKey } from "../utils/constants";
import { Modal, Form, Alert, Pagination } from "react-bootstrap";
import { toast } from "react-toastify";
import { Box, Chip, Sheet, Table, Typography, Button } from "@mui/joy";

const ItemsTable = ({ ownerReferenceId }) => {
  // State quản lý danh sách items
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State quản lý việc liệt kê và hủy bán
  const [selectedItem, setSelectedItem] = useState(null);
  const [listingPrice, setListingPrice] = useState("");
  const [showListingModal, setShowListingModal] = useState(false);
  const [listingError, setListingError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // State mới cho chức năng chỉnh sửa
  const [showEditModal, setShowEditModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editAttributes, setEditAttributes] = useState([]);
  const [editError, setEditError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  // Thêm vào các state khác của component
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);
  // Các state mới cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  //Thêm state để quản lý loại tiền tệ:
  const [selectedCurrency, setSelectedCurrency] = useState("USDC");
  const availableCurrencies = items
    .filter((item) => item.type === "Currency")
    .map((item) => item.item);

  // Thêm ở đầu file, ngay sau các import
  const CLOUDINARY_UPLOAD_PRESET = "ARTSOLANA";
  const CLOUDINARY_CLOUD_NAME = "dy3nmkszo";

  // Hàm upload ảnh lên Cloudinary
  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("api_key", process.env.REACT_APP_CLOUDINARY_API_KEY);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Upload failed");
      }

      const data = await response.json();
      return data.secure_url;
    } catch (err) {
      console.error("Error uploading to Cloudinary:", err);
      throw new Error(
        "Không thể tải lên hình ảnh. Vui lòng thử lại. Chi tiết: " + err.message
      );
    }
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setEditError("Kích thước file không được vượt quá 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        setEditError("Vui lòng chọn file hình ảnh");
        return;
      }

      setEditImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // State quản lý bộ lọc thị trường
  const [marketFilter, setMarketFilter] = useState("all");

  // Hàm tìm nạp danh sách items
  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Xây dựng URL với các tham số lọc
      let url = `https://api.gameshift.dev/nx/items`;
      const params = new URLSearchParams();

      // Thêm tham số chủ sở hữu nếu có
      if (ownerReferenceId) {
        params.append("ownerReferenceId", ownerReferenceId);
      }

      // Áp dụng bộ lọc trạng thái bán
      switch (marketFilter) {
        case "forSale":
          params.append("forSale", "true");
          break;
        case "notForSale":
          params.append("price", "null");
          break;
        default:
          // Trường hợp tất cả
          break;
      }

      // Xây dựng URL với các tham số tìm nạp
      url += `?${params.toString()}`;

      // Gọi API để lấy danh sách items
      const response = await fetch(url, {
        headers: {
          accept: "application/json",
          "x-api-key": apiKey,
        },
      });

      // Kiểm tra phản hồi của API
      if (!response.ok) {
        throw new Error("Không thể tải danh sách items");
      }

      // Chuyển đổi dữ liệu nhận được thành JSON
      const data = await response.json();

      // Lọc lại danh sách nếu cần thiết
      if (marketFilter === "notForSale") {
        setItems(data.data.filter((item) => item.item.priceCents === null));
      } else {
        setItems(data.data || []);
      }
    } catch (err) {
      setError("Lỗi khi tải items: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [ownerReferenceId, marketFilter]);

  // Tính toán các giá trị phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);

  // Tính tổng số trang
  const totalPages = Math.ceil(items.length / itemsPerPage);

  // Tự động tải items khi component mount hoặc các dependency thay đổi
  useEffect(() => {
    fetchItems();
  }, [ownerReferenceId, marketFilter, fetchItems]); // Thêm fetchItems vào dependencies

  // Hàm xử lý liệt kê tài sản bán
  const handleListForSale = async () => {
    if (!selectedItem || !listingPrice) {
      setListingError("Vui lòng nhập giá hợp lệ");
      return;
    }

    if (selectedCurrency !== "USDC") {
      toast.error("Only USDC is supported");
      return;
    }

    setIsProcessing(true);
    setListingError(null);

    try {

      const response = await fetch(
        `https://api.gameshift.dev/nx/unique-assets/${selectedItem.id}/list-for-sale`,
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            "x-api-key": apiKey,
          },
          body: JSON.stringify({
            price: {
              currencyId: selectedCurrency, // Sử dụng selectedCurrency thay vì hardcode
              naturalAmount: listingPrice,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Không thể liệt kê tài sản");
      }

      const data = await response.json();

      // Thay vì window.location.href, mở tab mới
      if (data.consentUrl) {
        window.open(data.consentUrl, "_blank", "noopener,noreferrer");
      }

      // Làm mới danh sách sau khi liệt kê
      fetchItems();
    } catch (err) {
      console.log(err);

      setListingError(err.message);
    } finally {
      setIsProcessing(false);
      setShowListingModal(false);
    }
  };
  // Hàm xử lý hủy bán tài sản
  const handleCancelSale = async (itemId) => {
    setIsProcessing(true);
    setListingError(null);

    try {
      // Gọi API để hủy bán tài sản với URL mới cho unique assets
      const response = await fetch(
        `https://api.gameshift.dev/nx/unique-assets/${itemId}/cancel-listing`,
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "x-api-key": apiKey,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Không thể hủy bán tài sản");
      }

      const data = await response.json();

      // Mở URL đồng ý trong tab mới thay vì chuyển hướng
      if (data.consentUrl) {
        window.open(data.consentUrl, "_blank", "noopener,noreferrer");
      }

      // Làm mới danh sách sau khi hủy bán
      fetchItems();
    } catch (err) {
      setListingError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Mở modal để liệt kê tài sản
  const openListingModal = (item) => {
    setSelectedItem(item);
    setListingPrice("");
    setSelectedCurrency(availableCurrencies[0]?.id || "USDC");
    setListingError(null);
    setShowListingModal(true);
  };

  // Hàm rút gọn văn bản
  const truncateText = (text, maxLength) => {
    if (!text) return "-";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  // Hàm mở modal chỉnh sửa
  const openEditModal = (item) => {
    setEditItem(item);
    setEditImageUrl(item.imageUrl || "");
    setEditImageFile(null);
    setEditImagePreview(null);

    // Khởi tạo attributes từ item hiện tại
    setEditAttributes(item.attributes || []);

    setEditError(null);
    setShowEditModal(true);
  };

  // Hàm thêm thuộc tính mới
  const addAttribute = () => {
    setEditAttributes([...editAttributes, { traitType: "", value: "" }]);
  };

  // Hàm xóa thuộc tính
  const removeAttribute = (indexToRemove) => {
    setEditAttributes(
      editAttributes.filter((_, index) => index !== indexToRemove)
    );
  };

  // Hàm cập nhật thuộc tính
  const updateAttribute = (index, field, value) => {
    const newAttributes = [...editAttributes];
    newAttributes[index][field] = value;
    setEditAttributes(newAttributes);
  };

  const handleEditAsset = async () => {
    if (!editItem) return;

    setIsEditing(true);
    setEditError(null);

    try {
      let newImageUrl = editImageUrl;

      // Nếu có file ảnh mới, tiến hành upload
      if (editImageFile) {
        newImageUrl = await uploadImageToCloudinary(editImageFile);
      }

      // Chuẩn bị payload cho API
      const payload = {
        imageUrl: newImageUrl,
        attributes: editAttributes,
      };

      const response = await fetch(
        `https://api.gameshift.dev/nx/unique-assets/${editItem.id}`,
        {
          method: "PUT",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            "x-api-key": apiKey,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Không thể chỉnh sửa tài sản");
      }

      // Làm mới danh sách sau khi chỉnh sửa
      await fetchItems();

      // Đóng modal và reset state
      setShowEditModal(false);
      setEditImageFile(null);
      setEditImagePreview(null);
    } catch (err) {
      setEditError(err.message);
    } finally {
      setIsEditing(false);
    }
  };

  // Reset state khi mở modal chỉnh sửa

  return (
    <div className="card w-100">
      {/* Tiêu đề và các nút điều khiển */}
      <div className="card-header ">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">Danh Sách Items</h5>
          <div className="d-flex align-items-center">
            {/* Dropdown lọc thị trường */}
            <select
              className="form-select form-select-sm me-2"
              style={{ width: "auto" }}
              value={marketFilter}
              onChange={(e) => setMarketFilter(e.target.value)}
            >
              <option value="all">Tất Cả Mặt Hàng</option>
              <option value="forSale">Đang Được Bán</option>
              <option value="notForSale">Chưa Được Bán</option>
            </select>
            <button onClick={fetchItems} className="btn btn-primary btn-sm">
              <i className="fas fa-sync-alt me-1"></i> Làm mới
            </button>
          </div>
        </div>
      </div>

      {/* Nội dung danh sách items */}
      <div className="card-body p-0">
        {/* Trạng thái tải và lỗi */}
        {loading ? (
          <div className="d-flex justify-content-center align-items-center p-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : error ? (
          <div className="alert alert-danger m-3">{error}</div>
        ) : items.length === 0 ? (
          <div className="text-center py-5 text-muted">
            Không tìm thấy items
          </div>
        ) : (
          <>
            <Sheet sx={{ backgroundColor: "transparent" }}>
              <Table sx={{ backgroundColor: "transparent" }} borderAxis="both">
                <thead>
                  <tr>
                    <th style={{ width: "80px" }} className="text-center">
                      Hình Ảnh
                    </th>
                    <th style={{ width: "180px" }} className="text-center">
                      Tên
                    </th>
                    <th style={{ width: "120px" }} className="text-center">
                      Trạng Thái{" "}
                    </th>
                    <th style={{ width: "90px" }} className="text-center">
                      Loại
                    </th>
                    <th style={{ width: "200px" }} className="text-center">
                      Địa chỉ
                    </th>
                    {/* <th style={{ width: "200px" }} className="text-center">Diện tích</th> */}
                    <th style={{ width: "150px" }} className="text-center">
                      Hành Động
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((itemData, index) => {
                    const { type, item } = itemData;
                    if (type === "Currency") return null;

                    return (
                      <tr key={index}>
                        <td className="text-center">
                          <Box
                            component="img"
                            src={item.imageUrl}
                            alt={item.name}
                            title={item.name}
                            sx={{
                              width: 100,
                              height: 100,
                              borderRadius: "4px",
                              objectFit: "cover",
                              border: "1px solid #ddd",
                              padding: "2px",
                            }}
                          />
                        </td>
                        <td>
                          <Typography
                            level="body1"
                            fontWeight="md"
                            noWrap
                            sx={{
                              mb: 0.5,
                            }}
                          >
                            {item.name || item.symbol || "-"}
                          </Typography>
                          <Typography
                            level="body3"
                            color="neutral"
                            sx={{
                              display: "block",
                              wordWrap: "break-word",
                            }}
                          >
                            ID: {truncateText(item.id, 15)}
                          </Typography>
                        </td>
                        <td className="text-center">
                          {item.price !== null &&
                          item.status === "Committed" ? (
                            <Box>
                              <Chip
                                level="body2"
                                fontWeight="lg"
                                color="success"
                                sx={{ mb: 0.5 }}
                              >
                                Đang Bán
                              </Chip>
                              <Typography
                                level="body3"
                                color="neutral"
                                sx={{ fontSize: "0.875rem" }}
                              >
                                {(item.price.naturalAmount / 1).toFixed(2)} USDC
                              </Typography>
                            </Box>
                          ) : (
                            <Chip level="body2" fontWeight="md" color="danger">
                              Chưa Bán
                            </Chip>
                          )}
                        </td>
                        <td className="text-center">
                          <Chip color="primary" size="md" variant="soft">
                            {itemData.type}
                          </Chip>
                        </td>
                        <td>
                          {type !== "Currency" && (
                            <Typography
                              level="body2"
                              noWrap
                              title={item.description}
                              sx={{
                                maxWidth: 300,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {item.description || "-"}
                            </Typography>
                          )}
                        </td>
                        {/* <td>
                            {type !== "Currency" && (
                              <Typography
                                level="body2"
                                noWrap
                                title={item.attributeName}
                                sx={{
                                  maxWidth: 50,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {item.attributeName || "-"}
                              </Typography>
                            )}
                          </td> */}
                        <td className="text-center">
                          {type === "UniqueAsset" && (
                            <Box
                              sx={{
                                display: "flex",
                                gap: 1,
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              {/* {!(
                                item.priceCents > 0 &&
                                item.status === "Committed"
                              ) && (
                                <Button
                                  variant="solid"
                                  color="neutral"
                                  size="sm"
                                  onClick={() => openEditModal(item)}
                                >
                                  Sửa
                                </Button>
                              )} */}

                              {item.price !== null &&
                              item.status === "Committed" ? (
                                <Button
                                  variant="solid"
                                  color="danger"
                                  size="sm"
                                  onClick={() => handleCancelSale(item.id)}
                                  disabled={isProcessing}
                                  loading={isProcessing}
                                >
                                  {isProcessing ? "Đang Xử Lý..." : "Hủy Bán"}
                                </Button>
                              ) : (
                                <Button
                                  variant="solid"
                                  color="primary"
                                  size="sm"
                                  onClick={() => openListingModal(item)}
                                >
                                  Liệt Kê Bán
                                </Button>
                              )}
                            </Box>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Sheet>

            {/* Phân trang */}
            <div className="d-flex justify-content-between align-items-center p-3">
              <div className="d-flex align-items-center">
                <div className="d-flex align-items-center">
                  <span className="me-2">Hiển thị:</span>
                  <select
                    className="form-select form-select-sm"
                    style={{ width: "auto" }}
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                  >
                    {[5, 10, 20, 50].map((size) => (
                      <option key={size} value={size}>
                        {size} mục
                      </option>
                    ))}
                  </select>
                </div>
                <span className="ms-3 text-muted">
                  Hiển thị {indexOfFirstItem + 1} -{" "}
                  {Math.min(indexOfLastItem, items.length)} của {items.length}{" "}
                  mục
                </span>
              </div>
              <Pagination className="mb-0">
                <Pagination.First
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                />
                <Pagination.Prev
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                />

                {(() => {
                  const paginationItems = [];
                  const maxPagesToShow = 5;
                  let startPage = Math.max(
                    1,
                    currentPage - Math.floor(maxPagesToShow / 2)
                  );
                  let endPage = Math.min(
                    totalPages,
                    startPage + maxPagesToShow - 1
                  );

                  if (endPage - startPage + 1 < maxPagesToShow) {
                    startPage = Math.max(1, endPage - maxPagesToShow + 1);
                  }

                  for (let number = startPage; number <= endPage; number++) {
                    paginationItems.push(
                      <Pagination.Item
                        key={number}
                        active={number === currentPage}
                        onClick={() => setCurrentPage(number)}
                      >
                        {number}
                      </Pagination.Item>
                    );
                  }

                  return paginationItems;
                })()}

                <Pagination.Next
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                />
                <Pagination.Last
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          </>
        )}
      </div>

      {/* Modal liệt kê bán */}
      <Modal show={showListingModal} onHide={() => setShowListingModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Liệt Kê Tài Sản Bán</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Hiển thị lỗi nếu có */}
          {listingError && <Alert variant="danger">{listingError}</Alert>}

          {/* Form nhập thông tin bán */}
          <Form>
            <Form.Group>
              <Form.Label>Tên Tài Sản</Form.Label>
              <Form.Control
                type="text"
                value={selectedItem?.name || ""}
                readOnly
              />
            </Form.Group>

            <Form.Group className="mt-3">
              <Form.Label>Loại Tiền</Form.Label>
              <Form.Select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                disabled={isProcessing}
              >
                {availableCurrencies.map((currency) => (
                  <option key={currency.id} value={currency.id}>
                    {currency.symbol}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mt-3">
              <Form.Label>Giá ({selectedCurrency})</Form.Label>
              <Form.Control
                type="number"
                placeholder={`Nhập giá (${selectedCurrency})`}
                value={listingPrice}
                onChange={(e) => setListingPrice(e.target.value)}
                min="0.01"
                step="0.01"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowListingModal(false)}
            disabled={isProcessing}
          >
            Hủy
          </Button>
          <Button
            color="primary"
            onClick={handleListForSale}
            disabled={isProcessing || !listingPrice}
            variant="solid"
          >
            {isProcessing ? "Đang Xử Lý..." : "Liệt Kê Bán"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal chỉnh sửa tài sản */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Chỉnh Sửa Tài Sản</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editError && <Alert variant="danger">{editError}</Alert>}

          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tên Tài Sản</Form.Label>
              <Form.Control type="text" value={editItem?.name || ""} readOnly />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Hình Ảnh</Form.Label>
              <div className="d-flex gap-3 align-items-start">
                <div className="flex-grow-1">
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleEditImageChange}
                    disabled={isEditing}
                  />
                  <Form.Text className="text-muted">
                    JPG, PNG, GIF (Max: 5MB)
                  </Form.Text>
                </div>
                {(editImagePreview || editImageUrl) && (
                  <div style={{ width: "100px", height: "100px" }}>
                    <img
                      src={editImagePreview || editImageUrl}
                      alt="Preview"
                      className="img-thumbnail"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                )}
              </div>
            </Form.Group>

            {/* Loại bỏ trường URL hình ảnh cũ */}

            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6>Thuộc Tính</h6>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={addAttribute}
              >
                Thêm Thuộc Tính
              </Button>
            </div>

            {editAttributes.map((attr, index) => (
              <div key={index} className="d-flex mb-2 gap-2">
                <Form.Control
                  type="text"
                  placeholder="Tên thuộc tính"
                  value={attr.traitType}
                  onChange={(e) =>
                    updateAttribute(index, "traitType", e.target.value)
                  }
                />
                <Form.Control
                  type="text"
                  placeholder="Giá trị thuộc tính"
                  value={attr.value}
                  onChange={(e) =>
                    updateAttribute(index, "value", e.target.value)
                  }
                />
                <Button
                  variant="outline-danger"
                  onClick={() => removeAttribute(index)}
                >
                  Xóa
                </Button>
              </div>
            ))}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowEditModal(false)}
            disabled={isEditing}
          >
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleEditAsset}
            disabled={isEditing}
          >
            {isEditing ? "Đang Lưu..." : "Lưu Thay Đổi"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ItemsTable;
