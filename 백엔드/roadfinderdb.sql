CREATE DATABASE  IF NOT EXISTS `roadfinderdb` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `roadfinderdb`;
-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: roadfinderdb
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `buildings`
--

DROP TABLE IF EXISTS `buildings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `buildings` (
  `BuildingName` varchar(20) NOT NULL,
  `Latitude` double NOT NULL,
  `Longitude` double NOT NULL,
  `Category` varchar(45) NOT NULL,
  PRIMARY KEY (`BuildingName`),
  UNIQUE KEY `BuildingIP_UNIQUE` (`Latitude`),
  UNIQUE KEY `Longitude_UNIQUE` (`Longitude`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `buildings`
--

LOCK TABLES `buildings` WRITE;
/*!40000 ALTER TABLE `buildings` DISABLE KEYS */;
INSERT INTO `buildings` VALUES ('105학군단',35.17923413146,126.90734947801,'부속시설'),('AI융합대학',35.1797030927,126.90641372891,'AI융합대학'),('CAFE',35.17895600805,126.90676486107,'부속시설'),('G&R허브',35.18144577041,126.90922821607,'부속시설'),('경영대 1호관',35.17688674305,126.90416106489,'경영대학'),('경영대 2호관',35.17658934216,126.90363499305,'경영대학'),('경영전문대학원',35.17591286087,126.91008342289,'대학원'),('공과대 3호관',35.1791290956,126.91048070811,'공과대학'),('공과대 4호관',35.17857136773,126.90880649549,'공과대학'),('공과대 5호관',35.1783095154,126.91094767769,'공과대학'),('공과대 7호관',35.17823554566,126.90925536547,'공과대학'),('공과대 엔진실습동',35.1802452788,126.90976487,'공과대학'),('공과대 자동차 공학관',35.17962320675,126.91009880664,'공과대학'),('공과대 중량실험동',35.17997603504,126.90978658951,'공과대학'),('공과대2호관',35.17919566764,126.90886622415,'공과대학'),('공동실험실습관',35.17605932507,126.91042460027,'부속시설'),('공룡체험학습관',35.17312817485,126.90946040333,'부속시설'),('교육융합관',35.17883377313,126.9058166716,'부속시설'),('금호연구관',35.17592395665,126.90966441724,'부속시설'),('기초과학특성화관',35.17632710238,126.91095582341,'부속시설'),('농생대 1호관',35.17600874431,126.90044379954,'농업생명과학대학'),('농생대 2호관',35.1765779765,126.90158053187,'농업생명과학대학'),('농생대 3호관',35.17639707381,126.90274854925,'농업생명과학대학'),('농생대 4호관',35.17599169664,126.90127462109,'농업생명과학대학'),('농생대 5호관',35.17469599159,126.90043105215,'농업생명과학대학'),('농생대 6호관',35.17277039082,126.89810196872,'농업생명과학대학'),('농업실습교육원',35.17468651904,126.90009501623,'부속시설'),('농업전문창업보육센터',35.1749280446,126.90001158633,'부속시설'),('대학본부',35.17586551959,126.90852595175,'부속시설'),('대학역사관',35.17594791834,126.90645674626,'부속시설'),('도서관 별관(백도)',35.17802103303,126.90684630925,'도서관'),('동물사육장',35.17546697505,126.8985793737,'부속시설'),('만들마루',35.18143097704,126.90837029523,'부속시설'),('미래교육관',35.17904477095,126.90692232755,'부속시설'),('민주마루',35.17604453146,126.90738024733,'부속시설'),('박물관',35.17534475553,126.91112505373,'부속시설'),('법전원 1호관',35.17423945902,126.90381923291,'대학원'),('법전원 2호관',35.17415042445,126.90269061298,'대학원'),('법전원 프라임홀',35.17436874561,126.90327636095,'부속시설'),('사범대 과학 교육관',35.17786273715,126.90961735739,'사범대학'),('사범대 체육교육관',35.17461982275,126.91168976112,'사범대학'),('사범대1호관',35.17781687567,126.90582006216,'사범대학'),('사회과학대학',35.17501518306,126.90418539861,'사회과학대학'),('사회과학대학별관',35.17510421574,126.90380764659,'사회과학대학'),('산학협력공학관',35.18005222298,126.91047346827,'부속시설'),('산학협력관 2',35.18142358035,126.90770242014,'부속시설'),('산학협력관 3',35.18091616603,126.90723183064,'부속시설'),('생체재료개발센터',35.17357549222,126.90083545655,'부속시설'),('생활과학대학',35.17387417085,126.91119564215,'생활과학대학'),('생활관 5호관 정아학사',35.18050786532,126.91118297243,'생활관'),('생활관 6호관 보람학사',35.1802179114,126.91131328952,'생활관'),('생활관 7호관 이룰학사',35.17646526695,126.89928273349,'생활관'),('생활관 8호관 한울학사',35.17623605976,126.89986094786,'생활관'),('생활관 9동 예향학사',35.1809337,126.9054699,'생활관'),('생활관 관리동',35.1808037356,126.91094586773,'생활관'),('석면환경센터',35.1731876909,126.90968613676,'부속시설'),('수의대 1호관',35.17396099041,126.90065005736,'수의과대학'),('수의대 2호관',35.17406802043,126.90171494728,'수의과대학'),('스토리움',35.17882286353,126.90691870763,'부속시설'),('실험동물사',35.17367683923,126.90115932735,'부속시설'),('약학대 2호관',35.17647430555,126.91153682044,'약학대학'),('약학대1호관',35.17682049085,126.91121193269,'약학대학'),('어린이집',35.17364337245,126.91035944082,'부속시설'),('언어교육원 별관',35.17843378441,126.90682639969,'부속시설'),('연암고익배홀',35.17711119733,126.91107799478,'약학대학'),('예술대 1호관',35.17958622175,126.90570241569,'예술대학'),('예술대 2호관',35.18037916141,126.90632504089,'예술대학'),('예술대 3호관',35.18018684485,126.90535852246,'예술대학'),('예술대 조소관',35.18064988319,126.90680649014,'예술대학'),('예술대 조형관',35.18083480192,126.90668341288,'예술대학'),('예향홀',35.17989688904,126.90512956348,'부속시설'),('용봉관',35.17593689267,126.90645083317,'부속시설'),('인문대 1호관',35.17740855939,126.90462910875,'인문대학'),('인문대 2호관',35.17796826224,126.90513494695,'인문대학'),('인문대 3호관',35.17691813259,126.90491236833,'인문대학'),('자동차교육실습동',35.18016613306,126.90952776529,'부속시설'),('자연과학대학 1호관',35.17729505706,126.90951840671,'자연과학대학'),('자연과학대학 2호관',35.17686265434,126.91001645438,'자연과학대학'),('자연과학대학 3호관',35.17651720893,126.91046079946,'자연과학대학'),('자연과학대학 4호관',35.17621540532,126.90954405493,'자연과학대학'),('자연대 5호관',35.17593579215,126.91086442045,'자연과학대학'),('전남대스포츠센터',35.17541133067,126.9119594451,'부속시설'),('전남대학교 동물병원',35.17442415517,126.90127230476,'부속시설'),('전남대학교 치과병원',35.17233752713,126.90052722944,''),('정보마루(디도)',35.17660671494,126.90559381721,'도서관'),('정보전산원',35.17880141171,126.90776938955,'부속시설'),('정비센터',35.18124975728,126.90713318875,'부속시설'),('제 1학생마루',35.17696029677,126.90749608474,'부속시설'),('제2학생마루',35.17490626092,126.90282966165,'부속시설'),('중앙도서관(홍도)',35.17699265156,126.90589392506,'도서관'),('진리관',35.17711310796,126.90325376478,'부속시설'),('창조관',35.17942940903,126.90780196791,'부속시설'),('청아관',35.18143789474,126.91061917018,'생활관'),('체육관',35.17511248186,126.91203727336,'부속시설'),('치전원 1호관 (임상교육관)',35.17241518495,126.90052607086,'대학원'),('치전원 3호관 (교육연구관)',35.17236167995,126.90123580476,'대학원'),('치전원 기초교육관',35.1736951542,126.90979111351,'대학원'),('친환경농업연구소',35.17274530617,126.89813326366,'부속시설'),('카페지젤',35.17650167569,126.90769699026,'부속시설'),('컨벤션홀',35.17555631559,126.90978749449,'부속시설'),('코스모스홀',35.17876368812,126.90934405349,'부속시설'),('특수동물사',35.17565924656,126.89892120452,'부속시설'),('파워플랜트',35.17971048955,126.91145627633,'부속시설'),('한국기초과학지원연구원 광주센터',35.17663334385,126.90937210877,'부속시설');
/*!40000 ALTER TABLE `buildings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `timetable`
--

DROP TABLE IF EXISTS `timetable`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `timetable` (
  `UserID` varchar(20) NOT NULL,
  `LectureName` varchar(20) NOT NULL,
  `BuildingName` varchar(45) NOT NULL,
  `day` varchar(5) NOT NULL,
  `start_time` int NOT NULL,
  `end_time` int NOT NULL,
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `BuildingName_UNIQUE` (`BuildingName`),
  UNIQUE KEY `start_time_UNIQUE` (`start_time`),
  UNIQUE KEY `end_time_UNIQUE` (`end_time`),
  CONSTRAINT `timetable_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `user` (`UserID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `timetable`
--

LOCK TABLES `timetable` WRITE;
/*!40000 ALTER TABLE `timetable` DISABLE KEYS */;
/*!40000 ALTER TABLE `timetable` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `timetable_has_buildings`
--

DROP TABLE IF EXISTS `timetable_has_buildings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `timetable_has_buildings` (
  `timetable_UserID` varchar(20) NOT NULL,
  `buildings_BuildingName` varchar(20) NOT NULL,
  KEY `fk_timetable_has_buildings_buildings1_idx` (`buildings_BuildingName`),
  KEY `fk_timetable_has_buildings_timetable1_idx` (`timetable_UserID`),
  CONSTRAINT `fk_timetable_has_buildings_buildings1` FOREIGN KEY (`buildings_BuildingName`) REFERENCES `buildings` (`BuildingName`),
  CONSTRAINT `fk_timetable_has_buildings_timetable1` FOREIGN KEY (`timetable_UserID`) REFERENCES `timetable` (`UserID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `timetable_has_buildings`
--

LOCK TABLES `timetable_has_buildings` WRITE;
/*!40000 ALTER TABLE `timetable_has_buildings` DISABLE KEYS */;
/*!40000 ALTER TABLE `timetable_has_buildings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `UserID` varchar(20) NOT NULL,
  `Password` varchar(45) NOT NULL,
  `PhoneNumber` char(11) NOT NULL,
  `UserName` varchar(6) NOT NULL,
  `email` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`UserID`,`Password`),
  UNIQUE KEY `Usercol_UNIQUE` (`PhoneNumber`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-28 11:06:48
