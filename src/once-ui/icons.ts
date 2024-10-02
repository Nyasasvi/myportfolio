import { IconType } from 'react-icons';

import {
	HiChevronUp,
	HiChevronDown,
	HiChevronRight,
	HiChevronLeft,
	HiArrowUpRight,
	HiOutlineArrowPath,
	HiCheck,
	HiMiniQuestionMarkCircle,
	HiMiniUser,
	HiMiniXMark,
	HiOutlineLink,
	HiExclamationTriangle,
	HiInformationCircle,
	HiExclamationCircle,
	HiCheckCircle,
} from "react-icons/hi2";
import { MdFileDownload } from "react-icons/md";

import {
	FaDiscord,
	FaGithub,
	FaLinkedin,
} from "react-icons/fa6";

import { FaJava, FaPython, FaJs, FaHtml5, FaCss3, FaNodeJs, FaGit, FaDocker, FaJenkins, FaAws, FaHome } from 'react-icons/fa';
import { SiVisualstudiocode, SiJetbrains, SiC, SiCplusplus, SiMysql, SiTypescript, SiExpress, SiNestjs, SiMarko, SiSelenium, SiJunit5, SiGraphql, SiJira, SiSpringboot, SiNextdotjs } from 'react-icons/si';
import { FiSun, FiMoon, FiExternalLink } from 'react-icons/fi';
import { FaInstagram,FaReact  } from "react-icons/fa";
import { IoMdMail } from "react-icons/io";
import { RxAvatar } from "react-icons/rx";
import { IoIosLink } from "react-icons/io";

import { CgWorkAlt } from "react-icons/cg";

export const iconLibrary: Record<string, IconType> = {
	chevronUp: HiChevronUp,
    chevronDown: HiChevronDown,
	chevronRight: HiChevronRight,
	chevronLeft: HiChevronLeft,
	refresh: HiOutlineArrowPath,
	arrowUpRight: HiArrowUpRight,
	check: HiCheck,
	helpCircle: HiMiniQuestionMarkCircle,
	infoCircle: HiInformationCircle,
	warningTriangle: HiExclamationTriangle,
	errorCircle: HiExclamationCircle,
	checkCircle: HiCheckCircle,
	person: HiMiniUser,
	close: HiMiniXMark,
	openLink: HiOutlineLink,
	discord: FaDiscord,
	github: FaGithub,
	linkedin: FaLinkedin,
	instagram: FaInstagram,
	mail: IoMdMail,
	react: FaReact,
	java: FaJava,
	python: FaPython,
	javascript:FaJs,
	html5: FaHtml5,
	css : FaCss3,
	c: SiC,
	cplusplus : SiCplusplus,
	mysql: SiMysql,
	typescript: SiTypescript,
	nodejs: FaNodeJs,
    express: SiExpress,
    nestjs: SiNestjs,
    marko: SiMarko,
    selenium: SiSelenium,
    junit: SiJunit5,
    graphql: SiGraphql,
    aws: FaAws,
    git: FaGit,
    docker: FaDocker,
    jenkins: FaJenkins,
    jira: SiJira,
    springboot: SiSpringboot,
	nextjs: SiNextdotjs,
	intellij: SiJetbrains,
	vscode: SiVisualstudiocode,
	light:FiSun,
	dark: FiMoon,
	download: MdFileDownload,
	link: FiExternalLink,
	home : FaHome,
	about : RxAvatar,
	projects: CgWorkAlt,
	githubLink: IoIosLink
};