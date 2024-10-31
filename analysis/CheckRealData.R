##### libraries ####
library(ggplot2)
library(ggpubr)
library(dplyr)
library(tidyr)
library(readr)
library(stringr)
library(gridExtra)
library(rstatix)
library(jsonlite)


##### Import data ############################

# location of files 
data_dir <- "C:\\Git\\SV_MasterThesis\\analysis\\RealData"
#data_dir <- "H:\\git\\SV_MasterThesis\\data"

# get list of files in folder
files <- list.files(data_dir, full.names = TRUE)
files

i<-0
for(f in files){
  i<-i+1
  f_data <- fromJSON(f, flatten = TRUE)
  assign(paste("df", i, sep = "_"), f_data)
}

# only take performanceB
df1_performanceB <- df_1$performanceB
df2_performanceB <- df_2$performanceB
df3_performanceB <- df_3$performanceB

# only take dynamic and remove infopages
df1_performanceB <- subset(df1_performanceB, df1_performanceB$sessionType!="infoPage" & df1_performanceB$isDynamic==TRUE)
df2_performanceB <- subset(df1_performanceB, df2_performanceB$sessionType!="infoPage" & df2_performanceB$isDynamic==TRUE)
df3_performanceB <- subset(df3_performanceB, df3_performanceB$sessionType!="infoPage" & df3_performanceB$isDynamic==TRUE)

temp <- df1_performanceB$sessionData




