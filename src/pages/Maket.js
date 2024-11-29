import React from 'react';
import "../assert/Market.css";

const Market = () => {
    const exchangeData = {
        solPrice: 192.50,
        usdcPrice: 1.00,
        lastUpdate: "2024-11-29 12:45:00",
        volume24h: "2,345,678",
        change24h: "+3.1%"
    };

    return (
        <div className="wiki-container">
            <div className="wiki-article">
                <h1>Tỷ giá Solana (SOL) / USD Coin (USDC)</h1>

                <div className="wiki-summary">
                    <p>
                        <strong>Solana (SOL)</strong> là một nền tảng blockchain hiệu suất cao, trong khi
                        <strong> USD Coin (USDC)</strong> là một đồng stablecoin được neo giá theo Đô la Mỹ.
                        Trang này cung cấp thông tin tỷ giá và chi tiết thị trường mới nhất.
                    </p>
                </div>

                <div className="wiki-sections">
                    <section className="current-rate">
                        <h2>Tỷ giá hiện tại</h2>
                        <div className="info-box">
                            <div className="rate-display">
                                <span className="current-price">${exchangeData.solPrice}</span>
                                <span className="currency">USDC mỗi SOL</span>
                            </div>
                            <div className="rate-details">
                                <div className="detail-row">
                                    <span>Thay đổi 24h:</span>
                                    <span className="change">{exchangeData.change24h}</span>
                                </div>
                                <div className="detail-row">
                                    <span>Thời lượng 24h:</span>
                                    <span>${exchangeData.volume24h}</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="market-info">
                        <h2>Thông tin thị trường</h2>
                        <table className="wiki-table">
                            <tbody>
                                <tr>
                                    <th>Loại tài sản</th>
                                    <td>Cặp tiền điện tử / Stablecoin</td>
                                </tr>
                                <tr>
                                    <th>Thời gian giao dịch</th>
                                    <td>24/7</td>
                                </tr>
                                <tr>
                                    <th>Cập nhật lần cuối</th>
                                    <td>{exchangeData.lastUpdate}</td>
                                </tr>
                            </tbody>
                        </table>
                    </section>

                    <section className="about-assets">
                        <h2>Về các tài sản</h2>
                        <p>
                            Solana (SOL) là một nền tảng blockchain phi tập trung được thiết kế để mở rộng và thực hiện giao dịch nhanh chóng.
                            USD Coin (USDC) là một stablecoin được bảo chứng hoàn toàn bởi tài sản dự trữ, duy trì tỷ lệ 1:1 với Đô la Mỹ.
                        </p>
                    </section>

                    <section className="references">
                        <h2>Tài liệu tham khảo</h2>
                        <ul>
                            <li>
                                <a href="https://solana.com" target="_blank" rel="noopener noreferrer">
                                    Trang web chính thức của Solana
                                </a>
                            </li>
                            <li>
                                <a href="https://www.circle.com/usdc" target="_blank" rel="noopener noreferrer">
                                    Thông tin về USD Coin
                                </a>
                            </li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Market;
