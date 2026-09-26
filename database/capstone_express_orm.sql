CREATE DATABASE IF NOT EXISTS `capstone_express_orm` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `capstone_express_orm`;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `luu_anh`;
DROP TABLE IF EXISTS `binh_luan`;
DROP TABLE IF EXISTS `hinh_anh`;
DROP TABLE IF EXISTS `nguoi_dung`;

CREATE TABLE `nguoi_dung` (
  `nguoi_dung_id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `mat_khau` varchar(255) NOT NULL,
  `ho_ten` varchar(255) DEFAULT NULL,
  `tuoi` int DEFAULT NULL,
  `anh_dai_dien` varchar(500) DEFAULT NULL,
  `ten_nguoi_dung` varchar(100) DEFAULT NULL,
  `gioi_thieu` text,
  `trang_web` varchar(500) DEFAULT NULL,
  `deletedBy` int NOT NULL DEFAULT '0',
  `isDeleted` tinyint(1) NOT NULL DEFAULT '0',
  `deletedAt` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`nguoi_dung_id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `ten_nguoi_dung` (`ten_nguoi_dung`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `hinh_anh` (
  `hinh_id` int NOT NULL AUTO_INCREMENT,
  `ten_hinh` varchar(255) NOT NULL,
  `duong_dan` varchar(500) NOT NULL,
  `mo_ta` text,
  `lien_ket` varchar(500) DEFAULT NULL,
  `nguoi_dung_id` int NOT NULL,
  `deletedBy` int NOT NULL DEFAULT '0',
  `isDeleted` tinyint(1) NOT NULL DEFAULT '0',
  `deletedAt` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`hinh_id`),
  KEY `nguoi_dung_id` (`nguoi_dung_id`),
  KEY `ten_hinh` (`ten_hinh`),
  CONSTRAINT `hinh_anh_ibfk_1` FOREIGN KEY (`nguoi_dung_id`) REFERENCES `nguoi_dung` (`nguoi_dung_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `binh_luan` (
  `binh_luan_id` int NOT NULL AUTO_INCREMENT,
  `nguoi_dung_id` int NOT NULL,
  `hinh_id` int NOT NULL,
  `ngay_binh_luan` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `noi_dung` varchar(1000) NOT NULL,
  `deletedBy` int NOT NULL DEFAULT '0',
  `isDeleted` tinyint(1) NOT NULL DEFAULT '0',
  `deletedAt` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`binh_luan_id`),
  KEY `nguoi_dung_id` (`nguoi_dung_id`),
  KEY `hinh_id` (`hinh_id`),
  CONSTRAINT `binh_luan_ibfk_1` FOREIGN KEY (`nguoi_dung_id`) REFERENCES `nguoi_dung` (`nguoi_dung_id`),
  CONSTRAINT `binh_luan_ibfk_2` FOREIGN KEY (`hinh_id`) REFERENCES `hinh_anh` (`hinh_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `luu_anh` (
  `nguoi_dung_id` int NOT NULL,
  `hinh_id` int NOT NULL,
  `ngay_luu` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deletedBy` int NOT NULL DEFAULT '0',
  `isDeleted` tinyint(1) NOT NULL DEFAULT '0',
  `deletedAt` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`nguoi_dung_id`, `hinh_id`),
  KEY `hinh_id` (`hinh_id`),
  CONSTRAINT `luu_anh_ibfk_1` FOREIGN KEY (`nguoi_dung_id`) REFERENCES `nguoi_dung` (`nguoi_dung_id`),
  CONSTRAINT `luu_anh_ibfk_2` FOREIGN KEY (`hinh_id`) REFERENCES `hinh_anh` (`hinh_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO `nguoi_dung` (`nguoi_dung_id`, `email`, `mat_khau`, `ho_ten`, `tuoi`, `anh_dai_dien`, `ten_nguoi_dung`, `gioi_thieu`, `trang_web`) VALUES
(1, 'sang@gmail.com', '$2b$10$VO5pP8QU1AGXqsiZ5E6E1.nTU4TiHOFnnorFg/TGCtdxD9bEuHQb2', 'Sang Nguyễn', 23, 'https://i.pravatar.cc/150?img=12', 'sangnguyen', 'Thích sưu tầm hình nền', NULL),
(2, 'phong@gmail.com', '$2b$10$VO5pP8QU1AGXqsiZ5E6E1.nTU4TiHOFnnorFg/TGCtdxD9bEuHQb2', 'Phong Từ Lâm', 25, 'https://i.pravatar.cc/150?img=33', 'phongtulam', NULL, NULL),
(3, 'nhu@gmail.com', '$2b$10$VO5pP8QU1AGXqsiZ5E6E1.nTU4TiHOFnnorFg/TGCtdxD9bEuHQb2', 'Nguyễn Như', 21, 'https://i.pravatar.cc/150?img=47', 'nguyennhu', NULL, 'https://example.com');

INSERT INTO `hinh_anh` (`hinh_id`, `ten_hinh`, `duong_dan`, `mo_ta`, `lien_ket`, `nguoi_dung_id`) VALUES
(1, 'Chó mực con', 'https://picsum.photos/id/237/600/800', 'Chú chó mực con đáng yêu', NULL, 1),
(2, 'Chó pug quấn chăn đi dạo', 'https://picsum.photos/id/1025/600/900', 'Trời lạnh cũng phải đi dạo', 'https://unsplash.com', 1),
(3, 'Dâu tây tươi', 'https://picsum.photos/id/1080/600/700', 'Một rổ dâu tây đỏ mọng', NULL, 2),
(4, 'Chó pug trùm chăn', 'https://picsum.photos/id/1062/600/1000', 'Hình nền điện thoại dễ thương', NULL, 2),
(5, 'Đọc sách giữa đồng cỏ', 'https://picsum.photos/id/1012/600/800', 'Một buổi chiều yên bình cùng cún', NULL, 2),
(6, 'Mũi mèo cận cảnh', 'https://picsum.photos/id/40/600/750', 'Hú leeeee', NULL, 3),
(7, 'Trái đất nhìn từ vũ trụ', 'https://picsum.photos/id/1002/600/900', 'Hình nền vũ trụ', NULL, 3),
(8, 'digsy', 'https://picsum.photos/id/1016/600/600', 'Shop graphic tees, artwork, iphone cases, and more designed by the worldwide Threadless community.', 'https://threadless.com', 3),
(9, 'Pha cà phê drip', 'https://picsum.photos/id/1060/600/800', 'Góc quán cà phê buổi sáng', NULL, 1),
(10, 'Thung lũng Yosemite', 'https://picsum.photos/id/1043/600/900', 'Rừng thông và vách đá', NULL, 1),
(11, 'Thác nước giữa rừng', 'https://picsum.photos/id/1039/600/1000', 'Thác nước và rêu xanh', NULL, 2),
(12, 'Xe cổ bỏ hoang', 'https://picsum.photos/id/1070/600/700', 'Vô lăng xe cổ giữa đồng cỏ', NULL, 3);

INSERT INTO `binh_luan` (`nguoi_dung_id`, `hinh_id`, `noi_dung`) VALUES
(2, 8, 'amazing, where can I contact you if I want to buy a design?'),
(1, 8, 'Đẹp quá!'),
(3, 1, 'Dễ thương quá'),
(1, 6, 'Hú leeeee'),
(2, 1, 'Cho mình xin ảnh gốc nhé');

INSERT INTO `luu_anh` (`nguoi_dung_id`, `hinh_id`) VALUES
(1, 3),
(1, 6),
(1, 8),
(2, 1),
(3, 2);
