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
  tm_polygons("recent_rate", breaks = c(0,10,20,30,40,50,60,70,80,90,100,200,300,10000))

pdf("/output/output.pdf", width = 11, height = 8.5)
print(fig1)
print(fig2)
invisible(dev.off())
