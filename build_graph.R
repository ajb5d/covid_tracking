options(tidyverse.quiet = TRUE)

library(tidyverse)
library(RcppRoll)
library(magrittr, warn.conflicts = FALSE)
library(janitor, warn.conflicts = FALSE)
library(glue, warn.conflicts = FALSE)
library(tmap, warn.conflicts = FALSE)
library(lubridate, warn.conflicts = FALSE)
suppressMessages(library(sf, warn.conflicts = FALSE))

pop_data <- read_csv(
  'data/population_data.csv',
  col_types = cols(
    .default = col_double(),
    SUMLEV = col_character(),
    STATE = col_character(),
    COUNTY = col_character(),
    STNAME = col_character(),
    CTYNAME = col_character()
  )
)

pop_data %<>%
  transmute(fips = str_c(STATE, COUNTY),
            population = POPESTIMATE2019 / 100000)

URL <- 'https://data.virginia.gov/api/views/bre9-aqqr/rows.csv?accessType=DOWNLOAD'
data <- read_csv(
  URL,
  col_types = cols(
    `Report Date` = col_date(format = "%m/%d/%Y"),
    FIPS = col_character(),
    Locality = col_character(),
    `VDH Health District` = col_character(),
    `Total Cases` = col_double(),
    Hospitalizations = col_double(),
    Deaths = col_double()
  )
) %>% clean_names()

data %<>% left_join(pop_data, by = 'fips')

hd_data <- data %>%
  mutate(vdh_health_district = case_when(vdh_health_district == "Thomas Jefferson" ~ "Blue Ridge",
                                         TRUE ~ vdh_health_district))

DISTRICTS = c('Blue Ridge', 'Fairfax', 'Virginia Beach')

fig_data <- hd_data %>%
  filter(vdh_health_district %in% DISTRICTS) %>%
  group_by(vdh_health_district, report_date) %>%
  select(vdh_health_district, report_date, total_cases, deaths, population) %>%
  summarise_all(sum) %>%
  mutate(daily_cases = total_cases - lag(total_cases),
         cases.7d = roll_mean(daily_cases, 7, fill = NA, align='right'))

THRESHOLD_DATE <- fig_data$report_date %>% unique() %>% sort(decreasing = TRUE) %>% nth(90)

fig1 <- fig_data %>%
  mutate(vdh_health_district = as_factor(vdh_health_district)) %>%
  filter(report_date >= THRESHOLD_DATE) %>% 
  ggplot(aes(report_date,  cases.7d/population, color = vdh_health_district)) +
  geom_point(aes(y=daily_cases/population), size = 0.8) + 
  geom_line() + 
  scale_color_brewer('Health District', palette = 'Set1') + 
  labs(x = "Lab Report Date",
       y = "Cases/100,000 population",
       title = glue("VA COVID Data as of {Sys.time()}"))

INTERVAL = ddays(7)
current_data <- data %>% filter(report_date == max(report_date))
lag_data <- data %>%
  filter(report_date == (max(report_date) - INTERVAL)) %>%
  select(fips, total_cases, hospitalizations, deaths)

current_data %<>% left_join(lag_data, by = 'fips', suffix = c("", ".lag"))
current_data %<>% mutate(recent_cases = total_cases - total_cases.lag,
                         recent_rate = (recent_cases / population) / (INTERVAL / ddays(1)))

county_shapes <- read_sf("data/cb_2018_us_county_20m/cb_2018_us_county_20m.shp") %>% 
  filter(STATEFP == "51") %>% 
  mutate(fips = str_c(STATEFP, COUNTYFP))

county_shapes %<>% left_join(current_data, by = 'fips')
fig2 <- tm_shape(county_shapes) + 
  tm_polygons("recent_rate",
              breaks = c(0,10,20,30,40,50,60,70,80,90,100,200,300,10000),
              title = "7d average of Cases / 100k / Day ")


URL <- "https://data.virginia.gov/api/views/3u5k-c2gr/rows.csv?accessType=DOWNLOAD"
data <- read_csv(URL, col_types = cols(
  `Lab Report Date` = col_character(),
  `Health District` = col_character(),
  `Number of PCR Testing Encounters` = col_double(),
  `Number of Positive PCR Testing Encounters` = col_double(),
  `Number of Antigen Testing Encounters` = col_double(),
  `Number of Positive Antigen Testing Encounters` = col_double(),
  `Number of Antibody Testing Encounters` = col_double(),
  `Number of Positive Antibody Testing Encounters` = col_double(),
  `Total Number of Testing Encounters` = col_double(),
  `Total Number of Positive Testing Encounters` = col_double()
)) %>% clean_names()

data %<>%
  mutate(vdh_health_district = case_when(health_district == "Thomas Jefferson" ~ "Blue Ridge",
                                         TRUE ~ health_district), 
         lab_report_date = na_if(lab_report_date, "Not Reported"),
         lab_report_date = parse_date(lab_report_date, format = "%m/%d/%Y"))

MAX_DATE = max(data$lab_report_date, na.rm=TRUE)
data %<>%
  filter(lab_report_date >= MAX_DATE - ddays(7)) %>%
  select(-lab_report_date) %>%
  group_by(health_district) %>%
  summarise(across(starts_with("number"), ~ sum(.x, na.rm = TRUE)), .groups = 'drop')



hd_maps <- read_sf("data/vdh_health_districts/geo_export_ede290cb-5737-433c-89a8-963e9f314650.shp")

hd_maps %<>%
  rename(health_district = vdh_hd) %>%
  mutate(health_district = case_when(health_district == "Thomas Jefferson" ~ "Blue Ridge",
                                     health_district == "Rappahannock/Rapidan" ~ "Rappahannock Rapidan",
                                     health_district == "Roanoke City" ~ "Roanoke",
                                     health_district == "Rappahannock Area" ~ "Rappahannock",
                                     health_district == "Pittsylvania/Danville" ~ "Pittsylvania-Danville",
                                         TRUE ~ health_district)) %>%
  left_join(data, by = "health_district")

hd_maps %<>%
  mutate(frac = number_of_positive_pcr_testing_encounters / number_of_pcr_testing_encounters)
  
fig3 <- tm_shape(hd_maps) + 
  tm_polygons("frac", breaks = c(0,0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 1), title = "7-day % PCR Positivity Rate")

pdf("/output/output.pdf", width = 11, height = 8.5)
print(fig1)
print(fig2)
print(fig3)
invisible(dev.off())
